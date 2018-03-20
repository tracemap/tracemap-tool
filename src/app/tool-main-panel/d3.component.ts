import { 
    Component, 
    NgModule, 
    ViewEncapsulation, 
    Output, 
    EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as $ from 'jquery';
import { ActivatedRoute } from '@angular/router';

import { MainCommunicationService } from './../services/main.communication.service';
import { HighlightService } from './../services/highlight.service';

@Component({
    selector: 'd3-component',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './d3.component.html',
    styleUrls: ['./d3.component.scss']
})

export class D3Component{
    @Output()
    nodeClicked:EventEmitter<string> = new EventEmitter();
    @Output()
    svgClicked:EventEmitter<any> = new EventEmitter();

    loaded: boolean = false;
    highlight: string;

    simulations: string[] = ["default","time"];
    simulateBy: string = "default";

    graphData = {
        "nodes": [],
        "links": []
    };

    canvas;
    context;
    dragging;
    simulation;
    width;
    height;

    hoveredNode;
    activeNode;

    colors = ["151,41,255","29,161,242"]
    scale = d3.scaleLinear().domain([2, 30]).range([6, 18]);

    constructor(
        private route: ActivatedRoute,
        private comService: MainCommunicationService,
        private highlightService: HighlightService
    ){ 
        // this.comService.resetUserNodeHighlight.subscribe( userId => {
        //     this.resetHighlightNode();
        // });
        this.highlightService.highlight.subscribe( area => {
            if( area == "graph") {
                this.highlight = "highlight"
            } else {
                this.highlight = "";
            }
        })
    }

    ticked() {
        this.graphData.nodes.forEach( node => {
            let x = node.x;
            let y = node.y;
            let r = node.r;
            if( x < 0 + r){
                node.x = 0 + r;
            } else if ( x > this.width - r) {
                node.x = this.width - r;
            }
            if( y < 0 + r){
                node.y = 0 + r;
            } else if ( this.simulateBy == "default" && y > this.height -r){
                node.y = this.height - r;
            } else if ( y > this.height - r - 100){
                node.y = this.height -r - 100;
            }
        });

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.beginPath();
        this.graphData.links.filter( link => {
            if( link.opacity == 1) {
                return link;
            }
        }).forEach( link => this.drawLink(link));
        this.context.stroke();

        this.context.beginPath();
        this.graphData.links.filter( link => {
            if( link.opacity == 0.2) {
                return link;
            }
        }).forEach( link => this.drawLink(link));
        this.context.stroke();

        this.context.beginPath();
        this.graphData.nodes.forEach(node => {
           if(node.group == 1) {
               this.drawNode(node);
           } else {
               this.drawAuthor(node);
           } 
        });
    }

    resizeCanvas() {
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.width = $('.canvas').width();
        this.height = $('.canvas').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.simulation.stop()
        this.setSimulation().then( (simulation) => {
            this.context.beginPath();
            this.simulation = simulation;
        });
    }

    render() {
        this.width = $('.canvas').width();
        this.height = $('.canvas').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.graphData.nodes.forEach( node => {
            node.r = this.scale(this.getNeighbours(node, "out")) * 1.6;
            node.opacity = 1.0;
            node.color = 0;
        });
        this.graphData.links.forEach( link => {
            link.opacity = 1.0;
        });
        this.addTimestamps();
        this.setSimulation().then( (simulation) => {
            this.simulation = simulation;
            d3.select(this.canvas)
                .call( d3.drag()
                    .container(this.canvas)
                    .subject( () => { return nodeHovered(this.canvas)})
                    .on("start", () => { return this.dragstarted() })
                    .on("drag", () => { return this.dragged()})
                    .on("end", () => { return this.dragended()}));
            d3.select(this.canvas)
                .on("mousemove", () => {
                    let node = nodeHovered(this.canvas);
                    if( node && !this.hoveredNode ) {
                        this.hoveredNode = node;
                        this.comService.userNodeHighlight.next(node.id_str);
                    } else if ( !node && this.hoveredNode && !this.dragging ){
                        this.comService.userNodeHighlight.next(undefined);
                    }
                })
                .on("click", () => {
                    let node = nodeHovered(this.canvas);
                    if( node) {
                        this.activeNode = node;
                        this.comService.userInfo.next(node.id_str);
                    } else if (!node) {
                        this.comService.userInfo.next(undefined);
                    }
                });

            function nodeHovered(canvas) {
                let mouse = d3.mouse(canvas);
                let x = mouse[0];
                let y = mouse[1];
                let node = simulation.find( x, y);
                return simulation.find( x, y, node.r);
            }

        });


        this.comService.userInfo.subscribe( userId => {
            if( userId) {
                this.graphData.nodes.forEach( node => {
                    if( node.id_str == userId) {
                        this.hoveredNode = undefined;
                        this.activeNode = node;
                        this.ticked();
                    }
                })
            } else {
                this.activeNode = undefined;
                this.ticked();
            }
        });
        this.comService.userNodeHighlight.subscribe( userId => {
            if( userId) {
                this.graphData.nodes.forEach( node => {
                    if( node.id_str == userId) {
                        this.hoveredNode = node;
                        this.highlightNeighbours(node);
                        this.ticked();
                    }
                });
            } else {
                this.resetHighlightNeighbours();
                this.hoveredNode = undefined;
                this.ticked();
            }
        }); 

    }


    addTimestamps() {
        this.graphData.nodes.forEach( node => {
            node.timestamp = Date.parse(node.retweet_created_at) / 1000;
        });
        this.graphData.nodes.sort( (a,b) => {
            return a.timestamp - b.timestamp;
        })
        let authorNode = this.graphData.nodes[0];
        let firstTime = authorNode.timestamp;
        let lastTime = this.graphData.nodes[this.graphData.nodes.length -1].timestamp;
        let multiplicator = (lastTime - firstTime) / (this.width - authorNode.r);
        this.graphData.nodes.forEach( node => {
            node.rel_timestamp = authorNode.r + ((node.timestamp - firstTime) / multiplicator);
        })
    }


    dragstarted() {
        this.dragging = true;
        if( !d3.event.active)
            this.simulation.alphaTarget(0.3).restart();
        if(this.simulateBy == "default") {
            d3.event.subject.fx = d3.event.subject.x;
        }
        d3.event.subject.fy = d3.event.subject.y;
    }

    dragged() {
        if(this.simulateBy == "default") {
            d3.event.subject.fx = d3.event.x;
        }
        d3.event.subject.fy = d3.event.y;
    }

    dragended() {
        this.dragging = false;
        if( !d3.event.active) 
            this.simulation.alphaTarget(0);
        if(d3.event.subject.group == 1) {
            if(this.simulateBy == "default") {
                d3.event.subject.fx = null;
            }
            d3.event.subject.fy = null;
        }
    }


    drawLink(d) {
        let angle = Math.atan2( d.target.y- d.source.y, d.target.x - d.source.x);
        let xPos = d.target.x - d.target.r * Math.cos(angle);
        let yPos = d.target.y - d.target.r * Math.sin(angle);
        this.context.moveTo(d.source.x, d.source.y);
        this.context.lineTo( xPos, yPos);
        this.context.strokeStyle = "rgba(140,140,140,"+d.opacity+")";
        this.context.lineWidth = 1;
        this.drawHead(xPos, yPos, angle)
    }

    drawHead(xPos, yPos, angle) {
        let headlen = 5;
        let headRightX = xPos - headlen * Math.cos(angle - Math.PI/6);
        let headRightY = yPos - headlen * Math.sin(angle - Math.PI/6); 
        this.context.lineTo( headRightX, headRightY);
        this.context.moveTo( xPos, yPos);
        let headLeftX = xPos - headlen * Math.cos(angle + Math.PI/6);
        let headLeftY = yPos - headlen * Math.sin(angle + Math.PI/6); 
        this.context.lineTo( headLeftX, headLeftY);

    }

    drawNode(d) {
        if( d == this.activeNode || d == this.hoveredNode) {
            d.color = 1;
        } else {
            d.color = 0;
        }
        let lineWidth = d.r / 7;
        let radius = d.r - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "rgba("+this.colors[d.color]+","+d.opacity+")";
        this.context.strokeStyle = "rgba("+this.colors[d.color]+","+d.opacity+")";
        this.context.fill();
        this.context.stroke();
    }

    drawAuthor(d) {
        if( d == this.activeNode || d == this.hoveredNode) {
            d.color = 1;
        } else {
            d.color = 0;
        }
        let lineWidth = d.r / 7;
        let radius = d.r - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.moveTo( d.x + radius / 2, d.y)
        this.context.arc(d.x, d.y, radius / 2, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "rgba("+this.colors[d.color]+","+d.opacity+")";
        this.context.fill();
        this.context.stroke();
    }

    setSimulation(sim=this.simulateBy): Promise<d3.forceSimulation> {
        this.simulateBy=sim;
        return new Promise( (resolve, reject) => {
            if( this.simulateBy == "default") {
                this.simulateDefault().then( (simulation) => {
                    resolve(simulation);
                });
            } else if( this.simulateBy == "time") {
                this.simulateTime().then( (simulation) => {
                    resolve(simulation);
                });
            }
        });
    }

    simulateDefault(): Promise<d3.forceSimulation> {
        return new Promise((resolve, reject) => {
            this.graphData.nodes.forEach( node => {
                if( node.group == 0) {
                    node.fx = node.r + 50;
                    node.fy = node.r + 50;
                } else {
                    delete node.fx;
                }
            });

            let simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) {
                    return d.id_str; 
                }).distance(function(d) {
                    let sourceRad = d.source.r;
                    let targetRad = d.target.r;
                    return (sourceRad + targetRad);
                }))
                .force("charge", d3.forceManyBody().strength(function(d) {
                    return d.r * -20;
                }))
                .force("collide", d3.forceCollide().radius(function(d) {
                    return d.r * 1.5;
                }))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2));

            simulation
                .nodes( this.graphData.nodes)
                .on( "tick", () => { return this.ticked()});

            simulation.force("link")
                .links(this.graphData.links);
            resolve(simulation);
        });

    }

    simulateTime(): Promise<d3.forceSimulation> {
        return new Promise( (resolve, reject) => {
            this.graphData.nodes.forEach( node => {
                node.fx = node.rel_timestamp;
            });
            let simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) {
                    return d.id_str; 
                }))
                .force("charge", d3.forceManyBody().strength(function(d) {
                    return d.r * -30;
                }));

            simulation
                .nodes( this.graphData.nodes)
                .on( "tick", () => { return this.ticked()});
            simulation.force("link")
                .links(this.graphData.links);
            resolve(simulation);
        });
    }

    highlightNeighbours( node, direction=undefined) {
        let childLinks;
        let children;
        let parentLinks;
        let parents;


        //set graphs opacity to 0.2
        this.graphData.nodes.forEach( node => {
            node.opacity = 0.2;
        });
        this.graphData.links.forEach( link => {
            link.opacity = 0.2;
        });
        //make neighbour links visible and create lists of children/parents
        if( !direction || direction=="out") { 
            childLinks = this.graphData.links.filter( link => {
                if( link.source == node) {
                    link.opacity = 1;
                    return link;
                }
            });
            children = childLinks.map( link => {
                return link.target;
            });
        }
        if( !direction || direction=="in") {
            parentLinks = this.graphData.links.filter( link => {
                if( link.target == node) {
                    link.opacity = 1;
                    return link;
                }
            });
            parents = parentLinks.map( link => {
                return link.source;
            });
        }

        node.opacity = 1;
        //make neighbour nodes visible
        if( !direction || direction=="out") {
            this.graphData.nodes.forEach( node => {
                if( children.indexOf(node) >= 0){
                    node.opacity = 1;
                }
            });
        }
        if( !direction || direction=="in") {
            this.graphData.nodes.forEach( node => {
                if( parents.indexOf(node) >= 0) {
                    node.opacity = 1;
                }
            });
        }
        this.ticked();        
    }

    resetHighlightNeighbours() {
        this.graphData.nodes.forEach( node => {
            node.opacity = 1;
        });
        this.graphData.links.forEach( link => {
            link.opacity = 1;
        });
        this.ticked();
    }

    getNeighbours(d, direction=undefined): number {
        let matches = [];
        this.graphData.links.forEach( link => {
            if( !direction || direction == "in") {
                if(link.target == d.id_str) {
                    matches.push(link);
                }
            }
            if(!direction || direction == "out") {
                if(link.source == d.id_str) {
                    matches.push(link);
                }
            }
        })
        return matches.length;
    }

    
}

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

    scale = d3.scaleLinear().domain([2, 30]).range([6, 18]);

    constructor(
        private route: ActivatedRoute,
        private comService: MainCommunicationService,
        private highlightService: HighlightService
    ){ 
        // this.comService.userNodeHighlight.subscribe( userId => {
        //     this.highlightNodeById(userId);
        // });
        // this.comService.resetUserNodeHighlight.subscribe( userId => {
        //     this.resetHighlightNode();
        // });
        // this.highlightService.highlight.subscribe( area => {
        //     if( area == "graph") {
        //         this.highlight = "highlight"
        //     } else {
        //         this.highlight = "";
        //     }
        // })
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
            } else if ( y > this.height -r){
                node.y = this.height - r;
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
        this.graphData.nodes.filter(node => {
           if(node.group == 1 && node.opacity == 1) {
               return node;
           } 
        }).forEach( node => this.drawNode(node));
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        this.graphData.nodes.filter(node => {
           if(node.group == 1 && node.opacity == 0.2) {
               return node;
           } 
        }).forEach( node => this.drawNode(node));
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        this.graphData.nodes.filter(node => {
            if(node.group == 0) {
                return node;
            }
        }).forEach( node => this.drawAuthor(node));
        this.context.fill();
        this.context.stroke();

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
        this.setSimulation(this.simulateBy).then( (simulation) => {
            this.context.beginPath();
            this.simulation = simulation;
        });
    }

    render() {
        this.comService.userInfo.subscribe( userId => {
            if( userId) {
                this.graphData.nodes.forEach( node => {
                    if( node.id_str == userId) {
                        this.activeNode = node;
                        console.log(this.activeNode);
                    }
                })
            } else {
                this.activeNode = undefined;
            }
        });


        this.width = $('.canvas').width();
        this.height = $('.canvas').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.graphData.nodes.forEach( node => {
            node.r = this.scale(this.getNeighbours(node, "out")) * 1.6;
            node.opacity = 1.0;
        });
        this.graphData.links.forEach( link => {
            link.opacity = 1.0;
        });
        this.setSimulation(this.simulateBy).then( (simulation) => {
            this.simulation = simulation;
            d3.select(this.canvas)
                .call( d3.drag()
                    .container(this.canvas)
                    .subject( () => { return node_hovered(this.canvas)})
                    .on("start", () => { return this.dragstarted() })
                    .on("drag", () => { return this.dragged()})
                    .on("end", () => { return this.dragended()}));

            d3.select(this.canvas)
                .on("mousemove", () => {
                    let node = node_hovered(this.canvas);
                    if( node && !this.hoveredNode ) {
                        this.hoveredNode = node;
                        this.highlightNeighbours(node);
                    } else if ( !node && this.hoveredNode && !this.dragging ){
                        this.hoveredNode = undefined;
                        this.resetHighlightNeighbours();
                    }
                })
                .on("click", () => {
                    let node = node_hovered(this.canvas);
                    if( node && node != this.activeNode) {
                        this.comService.userInfo.next(node.id_str);
                    } else if (!node && this.activeNode) {
                        this.comService.userInfo.next(undefined);
                    }
                });

            function node_hovered(canvas) {
                let mouse = d3.mouse(canvas);
                let x = mouse[0];
                let y = mouse[1];
                let node = simulation.find( x, y);
                return simulation.find( x, y, node.r);
            }
        });

    }



    dragstarted() {
        this.dragging = true;
        if( !d3.event.active)
            this.simulation.alphaTarget(0.1).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    dragged() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    dragended() {
        this.dragging = false;
        if( !d3.event.active) 
            this.simulation.alphaTarget(0);
        if(d3.event.subject.group == 1) {
            d3.event.subject.fy = null;
            d3.event.subject.fx = null;
        }
    }


    drawLink(d) {
        this.context.moveTo(d.source.x, d.source.y);
        this.context.lineTo(d.target.x, d.target.y);
        this.context.strokeStyle = "rgba(140,140,140,"+d.opacity+")";
        this.context.lineWidth = 1;
    }

    drawNode(d) {
        let lineWidth = 3.5;
        let radius = d.r - lineWidth;
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "rgba(151,41,255,"+d.opacity+")";
        this.context.strokeStyle = "rgba(151,41,255,"+d.opacity+")";
    }

    drawAuthor(d) {
        let lineWidth = d.r / 7;
        let radius = d.r - lineWidth;
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.moveTo( d.x + radius / 2, d.y)
        this.context.arc(d.x, d.y, radius / 2, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "rgba(151,41,255,"+d.opacity+")";
    }

    setSimulation( sim:string): Promise<d3.forceSimulation> {
        return new Promise( (resolve, reject) => {
            this.simulateBy = sim;
            if( this.simulateBy == "default") {
                this.simulateDefault().then( (simulation) => {
                    resolve(simulation);
                });
            } else if( this.simulateBy == "time") {
                this.simulateTime();
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
        })

    }

    simulateTime() {
        this.graphData.nodes.forEach( node => {
            if( node.group == 0) {
                node.fy = this.height / 2;
            }
            node.fx = node.rel_timestamp + 100;
        })

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) {
                return d.id_str; 
            }).distance(function(d) {
                let sourceRad = d.source.r;
                let targetRad = d.target.r;
                return sourceRad + targetRad;
            }))
            .force("collide", d3.forceCollide().radius(function(d) {
                return d.r * 1.5;
            }).strength(1))
            .force("charge", d3.forceManyBody().strength(function(d) {
                return d.r * -30;
            }));

        this.simulation
            .nodes( this.graphData.nodes)
            .on( "tick", () => { return this.ticked()});

        this.simulation.force("link")
            .links(this.graphData.links);

        d3.selectAll(".d3-graph circle").on(".drag", null);
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

    highlightHover( node) {
        let circle = d3.select(node);
        this.hoveredNode = circle;
        circle.classed("hovered", true);
    }



    highlightActive( node) {
        let circle = d3.select( node);
        this.activeNode = circle;
        circle.classed("active", true);
    }

    highlightNodeById( userId, active=undefined) {
        d3.selectAll('.d3-graph circle').filter( (node, index, circleArr) => {
            if( node['id_str'] == userId){
                if(active){
                    this.highlightActive( circleArr[index]);
                } else {
                    this.highlightHover( circleArr[index]);
                    this.highlightNeighbours( circleArr[index]);
                }
            }
        });
    }

    resetHighlightNode() {
        if( this.hoveredNode ) {
            this.hoveredNode.classed("hovered", false);
            this.resetHighlightNeighbours();
        }
    }

    resetActiveNode() {
        if( this.activeNode) {
            this.activeNode.classed("active", false);
        }
    }


    getNeighbours(d, direction=""): number {
        let degree = 0;
        for( let i in this.graphData.links) {
            let source = this.graphData.links[i].source;
            let target = this.graphData.links[i].target;
            let check = true;
            if( direction === "out") {
                check = ( source === d.id_str);
            } else if( direction === "in") {
                check = ( target === d.id_str);
            } else {
                check = ( source === d.id_str || target === d.id_str);    
            }
            if( check)
                degree += 1;
        }
        return degree;
    }

    
}

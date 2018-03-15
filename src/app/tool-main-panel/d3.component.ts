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

    svg;
    color;
    simulation;
    node;
    link;
    width;
    height;

    hoveredNode;
    activeNode;

    scale = d3.scaleLinear().domain([2, 30]).range([4, 18]);

    constructor(
        private route: ActivatedRoute,
        private comService: MainCommunicationService,
        private highlightService: HighlightService
    ){ 
/*        this.comService.userNodeHighlight.subscribe( userId => {
            this.highlightNodeById(userId);
        });
        this.comService.resetUserNodeHighlight.subscribe( userId => {
            this.resetHighlightNode();
        });
        this.comService.userInfo.subscribe( userId => {
            if(userId) {
                this.resetActiveNode();
                this.highlightNodeById(userId, "active");
            } else {
                this.resetActiveNode();
            }
        });
        this.highlightService.highlight.subscribe( area => {
            if( area == "graph") {
                this.highlight = "highlight"
            } else {
                this.highlight = "";
            }
        })
*/    }

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
        this.graphData.links.forEach( link => this.drawLink(link));
        this.context.stroke();

        this.context.beginPath();
        this.graphData.nodes.filter(node => {
           if(node.group == 1) {
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
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "#9729ff";
        this.context.fill();
        this.context.stroke();

    }

    render() {
        this.width = $('.d3-graph').width();
        this.height = $('.d3-graph').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.graphData.nodes.forEach( node => {
            node.r = this.scale(this.getNeighbours(node, "out")) * 1.6;
        });
        this.setSimulation(this.simulateBy);
        d3.select(this.canvas)
            .call( d3.drag()
                .container(this.canvas)
                .subject(this.dragsubject)
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended))


        // this.svg = d3.select(".d3-graph");
        // this.svg.on('click', () => {
        //     if( d3.event.target.toString() === '[object SVGSVGElement]') {
        //         this.comService.userInfo.next(undefined);
        //     }
        // });
        // this.svg.append('svg:defs').append('svg:marker')
        //         .attr('id','end-arrow')
        //         .attr('viewBox', '0 -5 10 10')
        //         .attr('refX', 6)
        //         .attr('markerWidth', 3)
        //         .attr('markerHeight', 3)
        //         .attr('orient', 'auto')
        //         .append('svg:path')
        //             .attr('d', 'M0, -5L10, 0L0,5')
        //             .attr('fill', '#666');
                     


        // this.graphData.nodes.forEach( node => {
        //     node.timestamp = Date.parse(node.retweet_created_at) / 1000;
        // });
        // this.graphData.nodes.sort( function(a,b){
        //     return a.timestamp - b.timestamp;
        // });
        // this.graphData.nodes.forEach( node => {
        //     let first_time = this.graphData.nodes[0].timestamp;
        //     let last_time = this.graphData.nodes[this.graphData.nodes.length - 1].timestamp;
        //     let multiplicator = (last_time - first_time) / (this.width - 270);
        //     node.rel_timestamp = (node.timestamp - first_time) / multiplicator;
        // });

        // this.color = ["#fff","#9729ff"];


        // this.link = this.svg.append("g")
        //     .attr("class", "links")
        //     .selectAll(".link")
        //     .data(this.graphData.links)
        //     .enter().append("svg:path")
        //             .attr('class','link')
        //             .attr("stroke", "#999")
        //             .attr("stroke-opacity", "0.8")
        //             .attr("stroke-width", "2")
        //             .style("marker-end","url(#end-arrow)");


        // this.node = this.svg.append("g")
        //     .attr("class", "nodes")
        //     .selectAll("circle")
        //     .data( this.graphData.nodes.filter( d => {
        //         if( this.getNeighbours(d) > 0) {
        //             return d;
        //         }
        //     }))
        //     .enter().append("circle")
        //             .attr("r", (d) => { 
        //                 d.r = this.scale(this.getNeighbours(d, "out"))*1.6; 
        //                 return d.r;
        //             })
        //             .attr("fill", (d) => { return this.color[d.group]; })
        //             .attr("stroke","#fff")
        //     .on('mouseenter', ( node, index, circleArr) => {
        //         this.comService.userNodeHighlight.next(node.id_str);
        //     })
        //     .on('mouseleave', ( node, index, circleArr) => { 
        //         this.comService.resetUserNodeHighlight.next(node.id_str);
        //     })
        //     .on('click', ( node, index, circleArr) =>  {
        //         this.comService.userInfo.next(node.id_str);
        //     });


        // this.loaded = true;

        // this.comService.userInfo.subscribe( userId => {
        //     if(userId) {
        //         this.resetActiveNode();
        //         this.highlightNodeById(userId, "active");
        //     } else {
        //         this.resetActiveNode();
        //     }
        // });
        // this.setSimulation( this.simulateBy);
    }


    dragsubject() {
        return this.simulation.find(d3.event.x, d3.event.y);
    }

    dragstarted() {
        this.simulation.force("center", null);
        if( !d3.event.active)
            this.simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    dragged() {
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    dragended() {
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
        this.context.strokeStyle = "#aaa";
        this.context.lineWidth = 1;
    }

    drawNode(d) {
        this.context.moveTo( d.x + d.r, d.y)
        this.context.arc(d.x, d.y, d.r, 0, 2*Math.PI);
        this.context.fillStyle = "#9729ff";
        this.context.strokeStyle = "#9729ff";
        this.context.lineWidth = 3.5;
    }

    drawAuthor(d) {
        this.context.moveTo( d.x + d.r - 1.5, d.y)
        this.context.arc(d.x, d.y, d.r - 1.5, 0, 2*Math.PI);
        this.context.moveTo( d.x + d.r / 2, d.y)
        this.context.arc(d.x, d.y, d.r / 2, 0, 2*Math.PI);
        this.context.lineWidth = 5;
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "#9729ff";

    }

    setSimulation( sim:string) {
        this.simulateBy = sim;
        if( this.simulateBy == "default") {
            this.simulateDefault();
        } else if( this.simulateBy == "time") {
            this.simulateTime();
        }
    }

    simulateDefault() {

        this.graphData.nodes.forEach( node => {
            if( node.group == 0) {
                node.fx = node.r + 50;
                node.fy = this.height / 2;
            } else {
                delete node.fx;
            }
        });

        this.simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(function(d) {
                return d.r * -30;
            }))
            .force("link", d3.forceLink().id(function(d) {
                return d.id_str; 
            }).distance(function(d) {
                let sourceRad = d.source.r;
                let targetRad = d.target.r;
                return sourceRad + targetRad;
            }))
            .force("collide", d3.forceCollide().radius(function(d) {
                return d.r * 1.5;
            }))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        this.simulation
            .nodes( this.graphData.nodes)
            .on( "tick", () => { return this.ticked()});

        this.simulation.force("link")
            .links(this.graphData.links);

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

    highlightNeighbours( c, direction=undefined) {
        this.link.classed("opac",true);

/*        d3.selectAll(".d3-graph .link").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
            if( neighbours.includes(sIndex) && 
                neighbours.includes(tIndex))
                return this;
        }).style("opacity", "1");
*/
    }

    resetHighlightNeighbours() {
        this.link.classed("opac",false);
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

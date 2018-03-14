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
        this.comService.userNodeHighlight.subscribe( userId => {
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
    }

    ticked() {
        let canvasWidth = this.width;
        let canvasHeight = this.height;

        this.node
            .attr("cx", function(d) { 
                if( d.x <= d.r + 3.5)
                    d.x = d.r + 3.5;
                else if( d.x >= (canvasWidth - (d.r + 3.5))){
                    d.x = canvasWidth - (d.r + 3.5);
                }
                return d.x;
            })
            .attr("cy", function(d) { 
                if( d.y <= d.r + 3.5)
                    d.y = d.r + 3.5;
                else if( d.y >= (canvasHeight - (d.r + 3.5)))
                    d.y = canvasHeight - (d.r + 3.5);
                return d.y;
            });
        this.link
            .attr('d', function(d) {
                let diffX = d.target.x - d.source.x,
                    diffY = d.target.y - d.source.y,
                    pathLength = Math.sqrt( diffX *diffX + diffY*diffY),
                    offsetX = diffX * (d.target.r + 5) / pathLength,
                    offsetY = diffY * (d.target.r + 5) / pathLength,
                    targetX = d.target.x - offsetX,
                    targetY = d.target.y - offsetY,
                    mValue = d.source.x + ',' + d.source.y,
                    lValue = targetX + ',' + targetY;
                return 'M' + mValue + 'L' + lValue;
            });
    }

    resetGraph() {
        if( this.link){
            this.loaded = false;
            this.svg.selectAll("*").remove();
        }
    }

    render() {
        this.svg = d3.select(".d3-graph");
        this.svg.on('click', () => {
            if( d3.event.target.toString() === '[object SVGSVGElement]') {
                this.comService.userInfo.next(undefined);
            }
        });
        this.svg.append('svg:defs').append('svg:marker')
                .attr('id','end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 6)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                    .attr('d', 'M0, -5L10, 0L0,5')
                    .attr('fill', '#666');
                     

        this.width = $('.d3-graph').width();
        this.height = $('.d3-graph').height();

        this.graphData.nodes.forEach( node => {
            node.timestamp = Date.parse(node.retweet_created_at) / 1000;
        });
        this.graphData.nodes.sort( function(a,b){
            return a.timestamp - b.timestamp;
        });
        this.graphData.nodes.forEach( node => {
            let first_time = this.graphData.nodes[0].timestamp;
            let last_time = this.graphData.nodes[this.graphData.nodes.length - 1].timestamp;
            let multiplicator = (last_time - first_time) / (this.width - 270);
            node.rel_timestamp = (node.timestamp - first_time) / multiplicator;
        });

        this.color = ["#fff","#9729ff"];


        this.link = this.svg.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(this.graphData.links)
            .enter().append("svg:path")
                    .attr('class','link')
                    .attr("stroke", "#999")
                    .attr("stroke-opacity", "0.8")
                    .attr("stroke-width", "2")
                    .style("marker-end","url(#end-arrow)");


        this.node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data( this.graphData.nodes.filter( d => {
                if( this.getNeighbours(d) > 0) {
                    return d;
                }
            }))
            .enter().append("circle")
                    .attr("r", (d) => { 
                        d.r = this.scale(this.getNeighbours(d, "out"))*1.6; 
                        return d.r;
                    })
                    .attr("fill", (d) => { return this.color[d.group]; })
                    .attr("stroke","#fff")
            .on('mouseenter', ( node, index, circleArr) => {
                this.comService.userNodeHighlight.next(node.id_str);
            })
            .on('mouseleave', ( node, index, circleArr) => { 
                this.comService.resetUserNodeHighlight.next(node.id_str);
            })
            .on('click', ( node, index, circleArr) =>  {
                this.comService.userInfo.next(node.id_str);
            });


        this.loaded = true;

        this.comService.userInfo.subscribe( userId => {
            if(userId) {
                this.resetActiveNode();
                this.highlightNodeById(userId, "active");
            } else {
                this.resetActiveNode();
            }
        });
        this.setSimulation( this.simulateBy);
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

        d3.selectAll(".d3-graph circle").call(d3.drag()
            .on("start", (d) => { return this.dragstarted(d)})
            .on("drag", (d) => { return this.dragged(d)})
            .on("end", (d) => { return this.dragended(d)}));
    }

    simulateTime() {
        this.graphData.nodes.forEach( node => {
            if( node.group == 0) {
                delete node.fy;
            }
            node.fx = node.rel_timestamp + 100;
        })

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) {
                return d.id_str; 
            }))
            .force("collide", d3.forceCollide().radius(function(d) {
                return d.r * 1.5;
            }).strength(1))
            .force("charge", d3.forceManyBody().strength(function(d) {
                return d.r * -30;
            }));

        this.simulation
            .nodes( this.graphData.nodes);

        this.simulation.force("link")
            .links(this.graphData.links);

        d3.selectAll(".d3-graph circle").on(".drag", null);
    }

    highlightNeighbours( c, direction=undefined) {
        let circle = d3.select(c);
        let links = this.link.nodes();
        let cIndex = c.__data__['index'];
        let neighbours = [];
        neighbours.push(cIndex);

        d3.selectAll(".d3-graph .link").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
                if ( sIndex === cIndex)
                    neighbours.push(tIndex);
                else if (tIndex === cIndex) 
                    neighbours.push(sIndex);
                else
                    return this;
        }).style("opacity", "0.2");

/*        d3.selectAll(".d3-graph .link").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
            if( neighbours.includes(sIndex) && 
                neighbours.includes(tIndex))
                return this;
        }).style("opacity", "1");
*/
        d3.selectAll(".d3-graph circle").filter( function( d, i){
            if( !neighbours.includes(d['index']))
                return this;
        }).style("opacity", "0.2");

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

    resetHighlightNeighbours() {
        d3.selectAll(".d3-graph circle").style("opacity", "1");
        d3.selectAll(".d3-graph .link").style("opacity", "1");
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

    dragged(d) {
        d.fy = d3.event.y;
        d.fx = d3.event.x;
    }

    dragstarted(d) {
        this.simulation.force("center", null);
        if( !d3.event.active)
            this.simulation.alphaTarget(0.3).restart();
        d.fy = d.y;
        d.fx = d.x
    }

    dragended(d) {
        if( !d3.event.active) this.simulation.alphaTarget(0);
        if(d.group == 1) {
            d.fy = null;
            d.fx = null;
        }
    }
}

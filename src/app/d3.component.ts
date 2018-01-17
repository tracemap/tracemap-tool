import { Component, NgModule, AfterViewInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
    selector: 'd3-component',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './d3.component.html',
    styleUrls: ['./d3.component.scss']
})

export class D3Component implements AfterViewInit{
    @Output()
    nodeClicked:EventEmitter<string> = new EventEmitter();
    @Output()
    svgClicked:EventEmitter<any> = new EventEmitter();

    graphData = {
        "nodes": [],
        "links": []
    };

    svg;
    color;
    simulation;
    node;
    link;
    scale = d3.scaleLinear().domain([1, 30]).range([3, 15]);

    width;
    height;

    onResize(event) {

        this.simulation
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .restart();
    }

    ngAfterViewInit() {
        this.svg = d3.select("svg");
        this.svg.on('click', () => {
            if( d3.event.target.toString() === '[object SVGSVGElement]') {
                this.callCloseUserInfo();
            }
        });
                     

        this.width = $('svg').width();
        this.height = $('svg').height();

        this.color = ["#9729ff","#fff"];

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; })
                                         .distance(function(d) {return 50;}))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        //TODO this.render(//TODO: add graph data here);
    }

    ticked() {
        let canvasWidth = this.width;
        let canvasHeight = this.height;

        this.node
            .attr("cx", function(d) { 
                if( d.x <= 10.0)
                    d.x = 10.0;
                else if( d.x >= canvasWidth){
                    d.x = canvasWidth - 10.0;
                }
                return d.x;
            })
            .attr("cy", function(d) { 
                if( d.y <= 10.0)
                    d.y = 10.0;
                else if( d.y >= canvasHeight)
                    d.y = canvasHeight - 10.0;
                return d.y;
            });
        this.link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
    }

    render() {
        console.log(this.width);
        console.log(this.height);
        this.link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.graphData.links)
            .enter().append("line")
                    .attr("stroke", "#999")
                    .attr("stroke-opacity", "0.8")
                    .attr("stroke-width", "2");

        this.node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data( this.graphData.nodes.filter( d => {
                if( this.getNeighbours(d) > 0) {
                    return d;
                }
            }))
            .enter().append("circle")
                    .attr("r", (d) => { return this.scale(this.getNeighbours(d))*1.5; })
                    .attr("fill", (d) => { return this.color[d.group]; })
                    .attr("stroke","#fff")
                    .attr("stroke-width","1.5px")
            .call(d3.drag()
                    .on("start", (d) => { return this.dragstarted(d)})
                    .on("drag", (d) => { return this.dragged(d)})
                    .on("end", (d) => { return this.dragended(d)}))
            .on('mouseenter', ( node, index, circleArr) => 
                this.highlightNeighbours( node, circleArr[index]))
            .on('mouseleave', ( node, index, circleArr) => 
                this.resetHighlighting( node, circleArr[index]))
            .on('click', ( node) => 
                this.callOpenUserInfo( node));

        this.node
            .append("title")
                .text( function(d) { return d.id; });

        this.simulation
            .nodes( this.graphData.nodes)
            .on( "tick", () => { return this.ticked()});

        this.simulation.force("link")
            .links(this.graphData.links);

    }

    scaleCircle( node, factor) {
        let r = node.attr("r");
        if( factor > 0){
            node.attr("r", r * factor)
                .raise();
        } else {
            node.attr("r", r / (factor*-1) )
        }
    }

    highlightNeighbours( n, c) {
        let circle = d3.select(c);
        this.scaleCircle(circle, 1.2);
        let links = this.link.nodes();
        let cIndex = c.__data__['index'];
        let neighbours = [];
        neighbours.push(cIndex);

        d3.selectAll("line").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
            if ( sIndex === cIndex)
                neighbours.push(tIndex);
            else if (tIndex === cIndex) 
                neighbours.push(sIndex);
            else
                return this;
        }).style("opacity", "0.2");

        d3.selectAll("line").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
            if( neighbours.includes(sIndex) && 
                neighbours.includes(tIndex))
                return this;
        }).style("opacity", "1");

        d3.selectAll("circle").filter( function( d, i){
            if( !neighbours.includes(d['index']))
                return this;
        }).style("opacity", "0.2");
    }

    resetHighlighting( n, c) {
        let circle = d3.select(c);
        this.scaleCircle(circle, -1.2);
        d3.selectAll("circle").style("opacity", "1");
        d3.selectAll("line").style("opacity", "1");
    }

    getNeighbours(d): number {
        let degree = 0;
        for( let i in this.graphData.links) {
            let source = this.graphData.links[i].source;
            let target = this.graphData.links[i].target;
            if( source === d.id || target === d.id )
                degree += 1;
        }
        return degree;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragstarted(d) {
        if( !d3.event.active)
            this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragended(d) {
        if( !d3.event.active) this.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
    }

    callOpenUserInfo(userId): void {
        userId = userId['id'];
        this.nodeClicked.emit(userId);
    }

    callCloseUserInfo(): void {
        this.svgClicked.emit();
    }
}
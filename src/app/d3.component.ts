import { Component, NgModule, AfterViewInit, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
    selector: 'd3-component',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './d3.component.html',
    styleUrls: ['./d3.component.scss']
})

export class D3Component implements AfterViewInit{

    graphData = {
        "nodes": [],
        "links": []
    };

    svg;
    color;
    simulation;
    node;
    link;
    scale = d3.scaleLinear().domain([1, 50]).range([5, 15]);


    width = $(window).width();
    height = $(window).height();

    onResize(event) {

        this.width = $(window).width();
        this.height = $(window).height();

        this.svg
            .attr("width", $(window).width())
            .attr("height", $(window).height());
        this.simulation
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .restart();
    }

    ngAfterViewInit() {
        this.svg = d3.select("svg")
        .attr("width", this.width)
        .attr("height", this.height);

        this.color = d3.scaleOrdinal(d3.schemeCategory20);

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        //TODO this.render(//TODO: add graph data here);
    }

    ticked() {
        this.link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })

        this.node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    render() {
        this.link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.graphData.links)
            .enter().append("line")
                    .attr("stroke", "#999")
                    .attr("stroke-opacity", "0.6")
                    .attr("stroke-width", "2");

        this.node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data( this.graphData.nodes)
            .enter().append("circle")
                    .attr("r", (d) => { return this.getNeighbours(d)*1.2; })
                    .attr("fill", (d) => { return this.color(d.group); })
                    .attr("stroke","#fff")
                    .attr("stroke-width","1.5px")
            .call(d3.drag()
                    .on("start", (d) => { return this.dragstarted(d)})
                    .on("drag", (d) => { return this.dragged(d)})
                    .on("end", (d) => { return this.dragended(d)}))
            .on('mouseenter', ( node, index, circleArr) => 
                this.highlightNeighbours( node, circleArr[index]))
            .on('mouseleave', ( node, index, circleArr) => 
                this.resetHighlighting( node, circleArr[index]));

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
                .style("stroke","#666")
                .style("stroke-width","3px")
                .raise();
        } else {
            node.attr("r", r / (factor*-1) )
                .style("stroke", "#fff")
                .style("stroke-width", "1.5px");
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
        return this.scale(degree);
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
}
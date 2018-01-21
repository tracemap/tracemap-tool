import { Component, NgModule, AfterViewInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as $ from 'jquery';
import { ActivatedRoute } from '@angular/router';

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
    width;
    height;

    selectedNode;

    scale = d3.scaleLinear().domain([2, 30]).range([4, 18]);

    constructor(
        private route: ActivatedRoute
    ){ }


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
                     

        this.width = $('svg').width();
        this.height = $('svg').height();

        this.color = ["#9729ff","#fff"];

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id_str; })
                                         .distance(function(d) {return 60;}))
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
            .attr('d', function(d) {
                let diffX = d.target.x - d.source.x,
                    diffY = d.target.y - d.source.y,
                    pathLength = Math.sqrt( diffX *diffX + diffY*diffY),
                    offsetX = diffX * (d.target.r + 5) / pathLength,
                    offsetY = diffY * (d.target.r + 5) / pathLength,
                    targetX = d.target.x - offsetX,
                    targetY = d.target.y - offsetY;
                return 'M' + d.source.x + ',' + d.source.y + 'L' + targetX + ',' + targetY;
            });
    }

    render() {
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
            .call(d3.drag()
                    .on("start", (d) => { return this.dragstarted(d)})
                    .on("drag", (d) => { return this.dragged(d)})
                    .on("end", (d) => { return this.dragended(d)}))
            .on('mouseenter', ( node, index, circleArr) => 
                this.highlightNeighbours( node, circleArr[index]))
            .on('mouseleave', ( node, index, circleArr) => 
                this.resetHighlighting( node, circleArr[index]))
            .on('click', ( node, index, circleArr) =>  {
                this.highlightSelection( circleArr[index]);
                this.callOpenUserInfo( node);
            });

        this.node
            .append("title")
                .text( function(d) { return d.id_str; });

        this.simulation
            .nodes( this.graphData.nodes)
            .on( "tick", () => { return this.ticked()});

        this.simulation.force("link")
            .links(this.graphData.links);
        if( this.route.firstChild.snapshot.params['uid']){
            let selectedUser = this.route.firstChild.snapshot.params['uid'];
            this.svg.selectAll("circle").filter( ( node, index, circleArray) =>{
                if( node['id_str'] == selectedUser){
                    this.highlightSelection( circleArray[index]);        
                }
            });
        }
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

        d3.selectAll(".link").filter( function( d, i){
            let sIndex = d['source']['index'];
            let tIndex = d['target']['index'];
            if ( sIndex === cIndex)
                neighbours.push(tIndex);
            else if (tIndex === cIndex) 
                neighbours.push(sIndex);
            else
                return this;
        }).style("opacity", "0.2");

        d3.selectAll(".link").filter( function( d, i){
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

    highlightSelection( node) {
        this.resetSelection();
        let circle = d3.select(node);
        this.selectedNode = circle;
        this.selectedNode.oldColor = this.selectedNode.attr("fill");
        circle.attr("fill", "#222");
    }

    resetSelection() {
        if( this.selectedNode){
            this.selectedNode.attr("fill", this.selectedNode.oldColor);
        }
    }

    resetHighlighting( n, c) {
        let circle = d3.select(c);
        this.scaleCircle(circle, -1.2);
        d3.selectAll("circle").style("opacity", "1");
        d3.selectAll(".link").style("opacity", "1");
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

    callOpenUserInfo(node): void {
        let userId = node['id_str'];
        this.nodeClicked.emit(userId);
    }

    callCloseUserInfo(): void {
        this.resetSelection();
        this.svgClicked.emit();
    }
}
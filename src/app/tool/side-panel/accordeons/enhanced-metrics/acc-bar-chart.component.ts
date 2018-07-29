import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';

import { CommunicationService } from './../../../services/communication.service';
import { GraphService } from './../../../services/graph.service';

import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './acc-bar-chart.component.html',
    styleUrls: [ './chart.component.scss',
                 './bar-chart.component.scss']
})

export class EnhancedBarChartComponent implements OnChanges {
    @Input('data')
    data: object;

    @ViewChild('barChart') elemBarChart;
    @ViewChild('xAxis') elemXAxis;

    userIds: string[];

    hoveredHereUid: string;

    @Output('rendered')
    rendered = new EventEmitter(false);

    isRendered = false;

    svg;
    xAxis;

    constructor(
        private communicationService: CommunicationService,
        private graphService: GraphService
    ) {
        this.graphService.userNodeHighlight.subscribe( uid => {
            if (this.svg) {
                if (uid) {
                    if (this.hoveredHereUid !== uid) {
                        this.scrollToUser(uid);
                    }
                    this.highlightBar(uid);
                } else {
                    this.resetHighlightBar();
                }
            }
        });
    }

    ngOnChanges() {
        if (this.data) {
            this.isRendered = false;
            if (this.svg) {
                this.rendered.next(false);
                this.svg.remove();
            }
            if (this.xAxis) {
                this.xAxis.remove();
            }

            const data = this.data['data'];

            // set dimension of the graph
            const imageSize = 40;
            const width = 241;
            const height = Math.floor(data.length * 40);

            // set range for x and scale for y
            const x = d3.scaleLinear().range([0, width]);
            const y = d3.scaleBand().range([0, height]);

            // create d3 svg and append data container
            this.svg = d3.select(this.elemBarChart.nativeElement)
                .attr('width', width)
                .attr('height', height)
                .append('g');

            // set the domain scale
            x.domain( [0, d3.max(data, (user) => user.value)]);
            y.domain( data.map( user => user.uid));

            // append bar chart rectangles
            this.svg.selectAll('.bar')
                .data(data)
                .enter().append('rect')
                    .attr('class', 'bar')
                    .attr('x', 0)
                    .attr('y', (d) => y(d.uid))
                    .attr('width', (d) => x(d.value))
                    .attr('height', y.bandwidth())
                    .attr('stroke', '#fff')
                    .attr('stroke-width', '2')
                    .attr('fill', '#7F25E6');

            // define xAxis values and ticks
            const xAxis = d3.axisBottom(x).ticks(5)
                .tickFormat( d => {
                    const k = 1000;
                    const mil = k * 1000;
                    if ( d > mil) {
                        return (d / mil).toFixed(1) + 'mil';
                    } else if ( d > k) {
                        return (d / k).toFixed(1) + 'k';
                    }
                    return d;
                }).tickSize(0).tickPadding(10);

            // create d3 svg for x-axis
            this.xAxis = d3.select(this.elemXAxis.nativeElement)
                .attr('width', width + imageSize)
                .attr('height', 20)
                .append('g')
                .attr('transform', `translate(${imageSize}, 0)`)
                .attr('stroke-width', '0.2px')
                .call(xAxis);

            // xAxis text styling
            this.xAxis.selectAll('text')
                .style('fill', '#8E9299')
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('font-family', 'IBM Plex Sans')
                .style('font-weight', '500');

            // interactive features
        }
    }

    highlightBar(uid: string): void {
        this.svg.selectAll('rect')
            .filter( rect => rect.uid !== uid)
            .attr('fill', '#242933');
        this.data['data']
            .forEach( node => {
                if (node.uid === uid) {
                    node['opac'] = false;
                } else {
                    node['opac'] = true;
                }
            });
    }

    resetHighlightBar(): void {
        this.svg.selectAll('rect')
            .attr('fill', '#7F25E6');
            this.data['data'].forEach( node => node['opac'] = false);
    }

    setHovered(uid: string): void {
        this.hoveredHereUid = uid;
        this.graphService.userNodeHighlight.next(uid);
    }

    scrollToUser(uid: string): void {
        const rect = this.svg.selectAll('rect').filter( element => {
            if (element.uid === uid) {
                return element;
            }
        }).node();
        const position = rect.y.baseVal.value;
        const scrollContainer = rect.parentElement.parentElement.parentElement;
        const maxScroll = scrollContainer.scrollTopMax;
        if (position - 75 < maxScroll) {
            scrollContainer.scrollTop = position - 75;
        } else {
            scrollContainer.scrollTop = maxScroll;
        }
    }

    setActiveNode(uid: string): void {
        this.graphService.activeNode.next(uid);
    }

}

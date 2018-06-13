import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { CommunicationService } from './../../services/communication.service';
import { GraphService } from './../../services/graph.service';

import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
    selector: 'line-chart',
    templateUrl: './acc-line-chart.component.html',
    styleUrls: ['./acc-line-chart.component.scss']
})

export class AccLineChartComponent implements OnChanges {
    @Input('data')
    data: object;

    @Output('rendered')
    rendered = new EventEmitter(false);

    svg;
    line;

    fullScreen = false;
    timesliderPosition = 0;

    constructor(
        private communicationService: CommunicationService,
        private graphService: GraphService
    ){
        this.communicationService.resetData.subscribe( reset => {
            if( reset && this.svg) {
                this.svg.remove();
            }
        })
        this.graphService.timesliderPosition.subscribe( timesliderPosition => {
            this.timesliderPosition = timesliderPosition;
            this.drawPath();
        })
    }

    ngOnChanges() {
        if( this.data) {
            if( this.svg) {
                this.svg.selectAll("path").remove();
            }
            let margin = 15;
            let width = $(".svg").width() - margin;
            let height = $(".svg").height() - margin;

            let validData = this.data["valid"];
            let yMax = validData[ validData.length - 1]["y"];
            let remainder = yMax % 20;
            let yDomain = remainder == 0 ? yMax : yMax + 20 - remainder;

            let xScale = d3.scaleTime()
                .domain( [0, validData[validData.length - 1].x])
                .range([0, width - margin]);
            let yScale = d3.scaleLinear()
                .domain([0, yDomain])
                .range([height - margin, 0]);

            this.svg = d3.select(".svg.small")
                .attr("width", width + "px")
                .attr("height", height + "px")
                .append("g")
                .attr("transform", `translate(${margin + 10}, ${margin / 2})`);

            this.line = d3.line()
                .x(d => xScale(d.x))
                .y(d => yScale(d.y));

            this.drawPath();

            let xAxis = d3.axisBottom(xScale).ticks(5)
                .tickFormat( d => {
                    let minute = 60;
                    let hour = minute * 60;
                    let day = hour * 24;
                    if ( d > day * 4) {
                        return (d / day).toFixed(1) + "d";
                    } else if( d > minute * 99) {
                        return (d / hour).toFixed(1) + "h";
                    } else {
                        return Math.floor(d / minute) + "m";
                    }
                }).tickSize(0).tickPadding(10);

            let yAxis = d3.axisLeft(yScale).ticks( 5).tickSize( - (width - margin) )
                    .tickSizeOuter(0)
                    .tickFormat( d => {
                        if (d > 999) {
                            if( d < 9999) {
                                return (d / 1000).toFixed(1) + "k";
                            } else {
                                return Math.floor(d / 1000) + "k";
                            }
                        }
                        return d;
                    });

            this.svg.append("g")
                .attr("transform", `translate(0, ${height - margin})`)
                .attr("stroke-width","2px")
                .call(xAxis);
            this.svg.append("g").attr("stroke-width", "0.2px")
                .classed("grid", true).call(yAxis);

            // Classing for styling reasons
            this.svg.selectAll("text")
                .style("fill","#8E9299")
                .style("font-size", "11px")
                .style("font-weight", "500")
                .style("font-family", "IBM Plex Sans")
                .style("font-weight", "500");
            this.rendered.next(true);    

        }
    }
    drawPath() {
        if(this.svg) {
            this.svg.selectAll("path").remove();
            let data = this.data["valid"].filter( d => {
                if( d.x <= this.timesliderPosition) {
                    return d;
                }
            })
            this.svg.append("path")
                .data([data])
                .attr("d", d => this.line(d))
                .attr("fill", "none")
                .attr("stroke", "#7F25E6")
                .attr("stroke-width", "2px");
        }
    }

    openFullScreen() {
        console.log("open full-screen")
        this.fullScreen = true;
    }

    closeFullScreen() {
        this.fullScreen = false;
    }
}

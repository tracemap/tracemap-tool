import { Component, Output, EventEmitter } from '@angular/core';

import { CommunicationService } from './../../services/communication.service';
import { GraphService } from './../../services/graph.service';

import * as d3 from 'd3';
import * as $ from 'jquery'; 

@Component({
    selector: 'acc-enhanced-metrics',
    templateUrl: './acc-enhanced-metrics.component.html',
    styleUrls: ['./acc-enhanced-metrics.component.scss']
})

export class AccEnhancedMetricsComponent {
    @Output()
    rendered = new EventEmitter();

    graphData: object;
    retweetCount: number;
    userCount: number;

    retweetsToTimeData: object;


    constructor(
        private communicationService: CommunicationService,
        private graphService: GraphService
    ){
        setTimeout( () => {
            this.rendered.next(true);
        }, 1000);
        this.communicationService.retweetCount.subscribe( retweetCount => {
            this.retweetCount = retweetCount;
        })
        this.graphService.graphData.subscribe( graphData => {
            if( graphData) {
                this.graphData = graphData;
                this.setRetweetsToTimeData();
            }
        })
    }

    setRetweetsToTimeData() {
        let users = this.graphData["nodes"].map( (node, index) => {
            let user = {};
            user["id_str"] = node["id_str"];
            user["x"] = node["rel_timestamp"];
            user["y"] = index;
            user["timestamp"] = node["timestamp"];
            return user;
        });
        let element = document.getElementsByClassName("retweets-to-time")[0];
        console.log(users);
        this.initChart( users, ".retweets-to-time");
    }

    initChart(data: object[], elementName: string) {
        let margin = 25;
        let width = $(elementName).width();
        let height = $(elementName).height();

        let xScale = d3.scaleTime()
            .domain( d3.extent(data, d => d.x))
            .range([0, width - margin]);
        let yScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([height - margin, 0]);

        let svg = d3.select(elementName)
            .attr("width", width + "px")
            .attr("height", height + "px")
            .append("g")
            .attr("transform", `translate(${margin}, 0)`);

        let line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        svg.append("path")
            .data([data])
            .attr("d", d => line(d))
            .attr("fill", "none")
            .attr("stroke", "#7F25E6")
            .attr("stroke-width", "2px");

        let xAxis = d3.axisBottom(xScale).ticks(6)
            .tickFormat( d => {
                let minute = 60;
                let hour = minute * 60;
                let day = hour * 24;
                if( d > minute * 99) {
                    return (d / hour).toFixed(1) + "h";
                } else if ( d > day * 4) {
                    return (d / day).toFixed(1) + "d";
                } else {
                    return Math.floor(d / minute) + "m";
                }
            });
        let yAxis = d3.axisLeft(yScale).ticks(4);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin})`)
            .attr("stroke-width","2px")
            .call(xAxis);
        svg.append("g").attr("stroke-width", "0px").call(yAxis);

        // Classing for styling reasons
        svg.selectAll("text")
            .style("fill","#8E9299")
            .style("font-size", "11px")
            .style("font-weight", "500")
            .style("font-family", "IBM Plex Sans")
            .style("font-weight", "500");

    }
}

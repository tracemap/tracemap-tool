import { Component } from '@angular/core';

import { GraphService } from './../services/graph.service';

import { ActivatedRoute, Params } from '@angular/router';

import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
    selector: 'graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})

export class GraphComponent {

    tracemapId;
    graphData = {
        nodes: [],
        links: [],
        author_info: {},
        retweet_info: {}
    };

    renderedNodes = [];
    renderedLinks = [];

    width;
    height;

    canvas;
    context;
    simulation;

    settings = {
        arrows: true,
        leafs: true,
        lastHighlight: true,
        nextHighlight: true,
        fixedDrag: true,
        fixedAuthor: true
    }

    colors = ["110,113,122","127,37,230"];
    linkColor = ["204,208,217"];
    scale = d3.scaleLinear().domain([2, 30]).range([6,18]);

    constructor(
        private graphService: GraphService,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe( (params: Params) => {
            if( params["tid"] != this.tracemapId) {
                this.resetGraph();
                this.tracemapId = params["tid"];
            }
        })
        this.graphService.graphData.subscribe( graphData => {
            if( graphData) {
                this.graphData.nodes = graphData["nodes"];
                this.graphData.links = graphData["links"];
                this.graphData.author_info = graphData["author_info"];
                this.graphData.retweet_info = graphData["retweet_info"];
                console.log("GraphComponent: Graph data added.")
                this.init();
            }
        })
        this.graphService.timesliderPosition.subscribe( time => {
            if( time != undefined) {
                let renderedNodes = [];
                let renderedNodeIds = [];
                let renderedLinks = [];
                this.graphData.nodes.forEach( node => {
                    if( node.rel_timestamp <= time) {
                        renderedNodes.push(node);
                        renderedNodeIds.push(node.id_str);
                    }
                })
                if( this.renderedNodes.length != renderedNodes.length) {
                    this.renderedNodes = renderedNodes;

                    this.graphData.links.forEach( link => {
                        if( renderedNodeIds.indexOf(link.source) >= 0 &&
                            renderedNodeIds.indexOf(link.target) >= 0) {
                            let renderedLink = {};
                            renderedLink['source'] = link.source;
                            renderedLink['target'] = link.target;
                            renderedLinks.push(renderedLink);
                        }
                    })
                    this.renderedLinks = renderedLinks;

                    if( this.simulation) {
                        this.simulation.nodes( this.renderedNodes)

                        this.simulation.force("link")
                            .links( this.renderedLinks);
                        this.simulation.restart();
                        this.simulation.alpha(0.1);
                    }
                }
            }
        })
        this.graphService.settings.subscribe( settings => {
            if( settings) {
                if( settings["arrows"] != this.settings.arrows) {
                    this.settings.arrows = settings["arrows"];
                    if( this.simulation) {
                        this.ticked()
                    }
                }
            }
        })
    }

    resetGraph() {
        console.log("resetting graph");
        if( this.simulation) {
            this.simulation.alpha(0);
            this.simulation.nodes([]);
            this.simulation.force("link").links([]);
        }
        if( this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    init() {
        this.width = $('.d3-graph').width();
        this.height = $('.d3-graph').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.context.translate(0.5, 0.5);
        this.context.imageSmoothingEnabled = true;
        this.graphData.nodes.forEach( node => {
            node.out_degree = this.getNeighbours(node, "out");
            node.r = this.scale(node.out_degree) * 1.6;
            node.opacity = 1.0;
            node.color = 0;
        })
        // update graphService.nodeList with out_degree for
        // acc-influential.component
        this.graphService.nodeList.next(this.graphData.nodes);
        this.graphData.links.forEach( link => {
            link.opacity = 1.0;
        })
        this.addTimestamps();
        this.setSimulation().then( (simulation) => {
            this.simulation = simulation;
            this.graphService.rendered.next(true);
        })
    }

    setSimulation(): Promise<d3.forceSimulation> {
        return new Promise( (resolve, reject) => {
            this.renderedNodes.forEach( node => {
                if( this.settings.fixedAuthor && node.group == 0) {
                    node.fx = this.width / 2;
                    node.fy = this.height / 2;
                }
            })

            let simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) {
                    return d.id_str;
                    }).distance( function(d) {
                        let sourceRad = d.source.r;
                        let targetRad = d.target.r;
                        return (sourceRad + targetRad);
                    }))
                .force("charge", d3.forceManyBody().strength( (d) => {
                    return (d.r * 2) * -20
                }))
                .force("collide", d3.forceCollide().radius( function(d) {
                    return d.r * 1.5;
                }))
                .force("center", d3.forceCenter(this.width/2, this.height/2));

            simulation
                .nodes( this.renderedNodes)
                .on( "tick", () => {return this.ticked()});

            simulation.force("link")
                .links( this.renderedLinks);
            resolve(simulation);
        })
    }

    ticked() {
        this.renderedNodes.forEach( node => {
            let x = node.x;
            let y = node.y;
            let r = node.r;
            if( x < 0 + r) {
                node.x = 0 + r;
            } else if ( x > this.canvas.width - r) {
                node.x = this.canvas.width - r;
            }
            if( y < 0 + r) {
                node.y = 0 + r;
            } else if ( y > this.canvas.height - r) {
                node.y = this.canvas.height - r;
            }
        });
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        this.renderedLinks.filter( link => {
            if( link.opacity == 1) {
                return link;
            }
        }).forEach( link => this.drawLink(link));
        this.context.stroke();

        this.context.beginPath();
        this.renderedLinks.filter( link => {
            if( link.opacity !== 1) {
                return link;
            }
        }).forEach( link => this.drawLink(link));
        this.context.stroke();

        this.context.beginPath();
        this.renderedNodes.forEach(node => {
            if( node.group == 1) {
                this.drawNode(node);
            } else {
                this.drawAuthor(node);
            }
        })
    }

    drawLink(d) {
        let angle = Math.atan2( d.target.y- d.source.y, 
                                d.target.x - d.source.x);
        let xPos = d.target.x - d.target.r * Math.cos(angle);
        let yPos = d.target.y - d.target.r * Math.sin(angle);
        this.context.moveTo(d.source.x, d.source.y);
        this.context.lineTo( xPos, yPos);
        this.context.strokeStyle = "rgba("+this.linkColor+","+d.opacity+")";
        this.context.lineWidth = 0.5;
        if( this.settings.arrows) {
            this.drawHead(xPos, yPos, angle)
        }
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
        d.color = 0;
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
        d.color = 1;
        let lineWidth = d.r / 2.2;
        let radius = d.r - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "rgba("+this.colors[d.color]+","+d.opacity+")";
        this.context.fill();
        this.context.stroke();
    }

    addTimestamps() {
        this.graphData.nodes.forEach( node => {
            node.timestamp = Date.parse(node.retweet_created_at) / 1000;
        })
        this.graphData.nodes.sort( (a,b) => {
            return a.timestamp - b.timestamp;
        })
        let tweetTime = this.graphData.nodes[0].timestamp;
        let lastRetweetTime = this.graphData.nodes[this.graphData.nodes.length - 1].timestamp;
        let relTimestampList = [];
        this.graphData.nodes.forEach( node => {
            node.rel_timestamp = node.timestamp - tweetTime;
            relTimestampList.push(node.rel_timestamp);
        });
        let timeRange = lastRetweetTime - tweetTime;
        console.log("GraphComponent: Timestamps added.")
        this.graphService.timeRange.next(timeRange);
        this.graphService.relTimestampList.next(relTimestampList);
    }

    getNeighbours(node, direction=undefined): number {
        let matches = [];
        this.graphData.links.forEach( link => {
            if( !direction || direction == "in") {
                if( link.target == node.id_str) {
                    matches.push(link);
                }
            }
            if( !direction || direction == "out") {
                if( link.source == node.id_str) {
                    matches.push(link);
                }
            }
        })
        return matches.length;
    }
}

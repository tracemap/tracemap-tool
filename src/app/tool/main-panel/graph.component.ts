import { Component } from '@angular/core';

import { GraphService } from './../services/graph.service';
import { CommunicationService } from './../services/communication.service';

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

    hoveredNode;
    activeNode;
    userPreviewRendered;

    width;
    height;

    canvas;
    context;
    simulation;
    dragging = false;

    settings = {
        arrows: true,
        leafs: true,
        lastHighlight: true,
        nextHighlight: true,
        fixedDrag: true,
        fixedAuthor: true
    }

    timesliderPosition = 0;

    colors = ["110,113,122","127,37,230", "76,80,89"];
    linkColors = ["204,208,217", "142,146,153"];
    scale = d3.scaleLinear().domain([2, 30]).range([6,18]);

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService,
        private route: ActivatedRoute,
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
                this.timesliderPosition = time;
                let renderedNodes = [];
                let renderedNodeIds = [];
                let renderedLinks = [];
                this.graphData.nodes.forEach( node => {
                    if( node.rel_timestamp <= time) {
                        if( this.settings.leafs
                            || node.out_degree != 0) {
                            renderedNodes.push(node);
                            renderedNodeIds.push(node.id_str);
                        }
                    }
                })
                if( this.renderedNodes.length != renderedNodes.length) {
                    this.renderedNodes = renderedNodes;

                    this.graphData.links.forEach( link => {
                        if( renderedNodeIds.indexOf(link.source_id) >= 0 &&
                            renderedNodeIds.indexOf(link.target_id) >= 0) {
                            renderedLinks.push(link);
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
                if( settings["fixedDrag"] != this.settings.fixedDrag
                    || settings["fixedAuthor"] != this.settings.fixedAuthor) {
                    this.settings.fixedDrag = settings["fixedDrag"];
                    this.settings.fixedAuthor = settings["fixedAuthor"];
                    this.changeFixed();
                }
                if( settings["leafs"] != this.settings.leafs) {
                    this.settings.leafs = settings["leafs"];
                    this.graphService.timesliderPosition.next(this.timesliderPosition);
                }
                if( this.settings.lastHighlight != settings["lastHighlight"]) {
                    this.settings.lastHighlight = settings["lastHighlight"];
                } 
                if( this.settings.nextHighlight != settings["nextHighlight"]) {
                    this.settings.nextHighlight = settings["nextHighlight"];
                } 
            }
        })
        this.graphService.rendered.subscribe( rendered => {
            if( rendered) {
                this.graphService.userNodeHighlight.subscribe( userId => {
                    if( userId) {
                        this.graphData.nodes.forEach( node => {
                            if( node.id_str == userId) {
                                this.hoveredNode = node;
                                this.highlightNeighbours( node);
                            }
                        })
                    } else {
                        this.hoveredNode = undefined;
                        this.userPreviewRendered = false;
                        this.resetHighlightNeighbours();
                    }
                })
                this.graphService.activeNode.subscribe( nodeId => {
                    if( nodeId) {
                        let node = this.getNodeById(nodeId).then( node => {
                            this.activeNode = node;
                            this.highlightNeighbours( node);
                        })
                    } else {
                        this.activeNode = undefined;
                        this.resetHighlightNeighbours();
                    }
                });
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

    resizeCanvas() {
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.width = $('.d3-graph').width();
        this.height = $('.d3-graph').height();
        this.canvas = document.querySelector(".d3-graph");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.simulation.stop();
        this.simulation.stop();
        this.setSimulation().then( (simulation) => {
            this.context.beginPath();
            this.simulation = simulation;
        })
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
        this.graphData.links.forEach( link => {
            link.opacity = 1;
            link.color = 0;
            link.target_id = link.target + "";
            link.source_id = link.source + "";
        })
        this.graphData.nodes.forEach( node => {
            node.out_degree = this.getNeighbours(node, "out");
            node.r = this.scale(node.out_degree) * 1.6;
            node.opacity = 1.0;
            node.color = 0;
        })
        // update graphService.nodeList with out_degree for
        // acc-influential.component
        this.graphService.nodeList.next(this.graphData.nodes);
        this.addTimestamps();
        this.setSimulation().then( (simulation) => {
            this.simulation = simulation;
            this.graphService.rendered.next(true);
            // Dragging calls
            d3.select(this.canvas)
                .call( d3.drag()
                    .container( this.canvas)
                    .subject( () => { return nodeHovered(this.canvas)})
                    .on("start", () => {return this.dragstarted() })
                    .on("drag", () => {return this.dragged() })
                    .on("end", () => { return this.dragended()}));
            // Hover behavior
            d3.select(this.canvas)
                .on("mousemove", () => {
                    let node = nodeHovered(this.canvas);
                    if( node && !this.hoveredNode) {
                        this.hoveredNode = node;
                        this.graphService.userNodeHighlight.next(node.id_str);
                    } else if ( !node
                                && this.hoveredNode
                                && !this.dragging) {
                        this.graphService.userNodeHighlight.next(undefined);
                    } else if ( node != this.hoveredNode 
                                && !this.dragging) {
                        this.hoveredNode = node;
                        this.graphService.userNodeHighlight.next(undefined);
                        this.graphService.userNodeHighlight.next(node.id_str);
                    }
                })
                .on("click", () => {
                    let node = nodeHovered(this.canvas);
                    if( node) {
                        this.graphService.activeNode.next(node.id_str);
                    } else {
                        this.graphService.activeNode.next(undefined);
                    }
                })

            function nodeHovered(canvas) {
                let mouse = d3.mouse(canvas);
                let x = mouse[0];
                let y = mouse[1];
                let node = simulation.find( x, y);
                return simulation.find( x, y, node.r + (node.r / 7));
            }
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
                .nodes( this.graphData.nodes)
                .on( "tick", () => {return this.ticked()});

            simulation.force("link")
                .links( this.graphData.links);
            resolve(simulation);
        })
    }

    ticked() {
        this.renderedNodes.forEach( node => {
            let x = node.x;
            let y = node.y;
            let r = node.r;
            if( x < (0 + r + 5)) {
                node.x = (0 + r + 5);
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

        this.renderedLinks.filter( link => link.opacity != 1).forEach( link => {
            this.drawLink( link);
        });

        this.renderedNodes.filter( node => node.opacity != 1).forEach(node => {
            if( node.group == 1) {
                this.drawNode(node);
            } else {
                this.drawAuthor(node);
            }
        })

        this.renderedLinks.filter( link => link.opacity == 1).forEach( link => {
            this.drawLink( link);
        });

        this.renderedNodes.filter( node => node.opacity == 1).forEach(node => {
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
        this.context.beginPath();
        this.context.moveTo(d.source.x, d.source.y);
        this.context.lineTo( xPos, yPos);
        this.context.strokeStyle = "rgba("+this.linkColors[d.color]+","+d.opacity+")";
        this.context.lineWidth = 0.8;
        this.context.stroke();
        if( this.settings.arrows) {
            this.drawHead(d, xPos, yPos, angle)
        }
    }

    drawHead(node, xPos, yPos, angle) {
        this.context.beginPath();
        this.context.moveTo(xPos, yPos);
        let headlen = 3;
        let headRightX = xPos - headlen * Math.cos(angle - Math.PI/6);
        let headRightY = yPos - headlen * Math.sin(angle - Math.PI/6); 
        this.context.lineTo( headRightX, headRightY);
        this.context.moveTo( xPos, yPos);
        let headLeftX = xPos - headlen * Math.cos(angle + Math.PI/6);
        let headLeftY = yPos - headlen * Math.sin(angle + Math.PI/6); 
        this.context.lineTo( headLeftX, headLeftY);
        this.context.strokeStyle = "rgba("+this.linkColors[1]+","+node.opacity+")";
        this.context.lineWidth = 1.5;
        this.context.stroke();
    }

    drawNode(d) {
        let lineWidth = 2;
        let radius = d.r - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.x + radius, d.y)
        this.context.arc(d.x, d.y, radius, 0, 2*Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = "rgba("+this.colors[d.color]+","+d.opacity+")";
        this.context.strokeStyle = "#F5F6F7";
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
                if( link.target_id == node.id_str) {
                    matches.push(link);
                }
            }
            if( !direction || direction == "out") {
                if( link.source_id == node.id_str) {
                    matches.push(link);
                }
            }
        })
        return matches.length;
    }

    highlightNeighbours( node) {
        let matchParents = this.settings.lastHighlight;
        let matchChildren = this.settings.nextHighlight;

        this.graphData.links.forEach( link => {
            link.opacity = 0.2;
        });
        this.graphData.nodes.forEach( node => {
            node.opacity = 0.2
        })

        if( matchChildren) {
            this.graphData.links.forEach( link => {
                if( link.source == node) {
                    link.opacity = 1;
                    link.color = 1;
                    link.target.opacity = 1;
                    link.target.color = 2;
                }
            })
        }
        if( matchParents) {
            this.graphData.links.forEach( link => {
                if( link.target == node) {
                    link.opacity = 1;
                    link.color = 1;
                    link.source.opacity = 1;
                    link.source.color = 2;
                }
            })
        }
        node.opacity = 1;
        node.color = 1;
        this.ticked();
    }

    resetHighlightNeighbours() {
        this.renderedLinks.forEach( link => {
            link.color = 0;
            link.opacity = 1;
        })
        this.renderedNodes.forEach( node => {
            node.color = 0;
            node.opacity = 1;
        })
        if( this.activeNode) {
            this.highlightNeighbours(this.activeNode);
        }
        this.ticked();
    }

    dragstarted() {
        this.dragging = true;
        if( !d3.event.active)
            this.simulation.alphaTarget(0.3).restart();
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
        let node = d3.event.subject;
        if( node.group == 1 && !this.settings.fixedDrag) {
            node.fx = null;
            node.fy = null;
        } else if (node.group == 0 && !this.settings.fixedAuthor) {
            node.fx = null;
            node.fy = null;
        }
    }

    changeFixed() {
        this.graphData.nodes.forEach( node => {
            if( node.group == 0) {
                if( this.settings.fixedAuthor) {
                    node.fx = node.x;
                    node.fy = node.y;
                } else {
                    node.fx = null;
                    node.fy = null;
                }
            } else {
                if( !this.settings.fixedDrag) {
                    node.fx = null;
                    node.fy = null;
                }
            }
        })
        if( this.simulation) {
            this.simulation.restart();
            this.simulation.alpha(0.3);
        }
    }

    setUserPreviewRendered( value) {
        setTimeout( () => {
            this.userPreviewRendered = value;
        }, 200);
    }

    getNodeById( nodeId): Promise<object> {
        return new Promise( (resolve, reject) => {
            this.graphData.nodes.forEach( node => {
                if( node.id_str == nodeId) {
                    resolve(node);
                }
            })
            reject();
        })
    }
}

import { Component } from '@angular/core';

import { GraphService } from '../services/graph.service';
import { CommunicationService } from '../services/communication.service';

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
    empty = false;

    renderedNodes = [];
    renderedLinks = [];

    connectedNodes = [];
    centeredNode;

    hoveredNode;
    activeNode;
    userPreviewRendered;

    width;
    height;
    dpr = 1;

    factor = 1;
    shiftX;
    shiftY;

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
    };

    timesliderPosition = 0;

    colors = ['110,113,122', '127,37,230', '76,80,89'];
    linkColors = ['204,208,217', '142,146,153'];
    scale = d3.scaleLinear().domain([2, 30]).range([8, 25]);

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService
    ) {
        this.communicationService.tweetId.subscribe( tweetId => {
            if ( tweetId !== this.tracemapId) {
                this.empty = false;
                this.resetGraph();
                this.tracemapId = tweetId;
            }
        });
        this.graphService.graphData.subscribe( graphData => {
            if ( graphData) {
                if (graphData['nodes'].length > 0) {
                    this.graphData.nodes = graphData['nodes'];
                    this.graphData.links = graphData['links'];
                    this.graphData.author_info = graphData['author_info'];
                    this.graphData.retweet_info = graphData['retweet_info'];
                    this.init();
                } else {
                    this.empty = true;
                }
            }
        });
        this.graphService.timesliderPosition.subscribe( time => {
            if ( time !== undefined) {
                this.timesliderPosition = time;
                const renderedNodes = [];
                const renderedNodeIds = [];
                const renderedLinks = [];
                this.graphData.nodes.forEach( node => {
                    if ( node.rel_timestamp <= time) {
                        if ( this.settings.leafs
                            || (node.out_degree !== 0 && node.degree > 1)) {
                            renderedNodes.push(node);
                            renderedNodeIds.push(node.id_str);
                        }
                    }
                });
                if ( this.renderedNodes.length !== renderedNodes.length) {
                    this.renderedNodes = renderedNodes;

                    this.graphData.links.forEach( link => {
                        if ( renderedNodeIds.indexOf(link.source_id) >= 0 &&
                            renderedNodeIds.indexOf(link.target_id) >= 0) {
                            renderedLinks.push(link);
                        }
                    });
                    this.renderedLinks = renderedLinks;

                    if ( this.simulation) {
                        this.simulation.nodes( this.renderedNodes);

                        this.simulation.force('link')
                            .links( this.renderedLinks);
                        this.simulation.restart();
                        this.simulation.alpha(0.1);
                    }
                }
            }
        });

        this.graphService.settings.subscribe( settings => {
            if ( settings) {
                if ( settings['arrows'] !== this.settings.arrows) {
                    this.settings.arrows = settings['arrows'];
                    if ( this.simulation) {
                        this.ticked();
                    }
                }
                if ( settings['fixedDrag'] !== this.settings.fixedDrag
                    || settings['fixedAuthor'] !== this.settings.fixedAuthor) {
                    this.settings.fixedDrag = settings['fixedDrag'];
                    this.settings.fixedAuthor = settings['fixedAuthor'];
                    this.changeFixed();
                }
                if ( settings['leafs'] !== this.settings.leafs) {
                    this.settings.leafs = settings['leafs'];
                    this.setConnectedNodes();
                    this.graphService.timesliderPosition.next(this.timesliderPosition);
                }
                if ( this.settings.lastHighlight !== settings['lastHighlight']) {
                    this.settings.lastHighlight = settings['lastHighlight'];
                }
                if ( this.settings.nextHighlight !== settings['nextHighlight']) {
                    this.settings.nextHighlight = settings['nextHighlight'];
                }
            }
        });
        this.graphService.rendered.subscribe( rendered => {
            if ( rendered) {
                this.graphService.userNodeHighlight.subscribe( userId => {
                    if ( userId) {
                        this.graphData.nodes.forEach( node => {
                            if ( node.id_str === userId) {
                                this.hoveredNode = node;
                                this.highlightNeighbours( node);
                            }
                        });
                    } else {
                        this.hoveredNode = undefined;
                        this.userPreviewRendered = false;
                        this.resetHighlightNeighbours();
                    }
                });
                this.graphService.activeNode.subscribe( nodeId => {
                    if ( nodeId) {
                        const node = this.getNodeById(nodeId).then( tmpNode => {
                            this.activeNode = tmpNode;
                            this.highlightNeighbours( tmpNode);
                        });
                    } else {
                        this.activeNode = undefined;
                        this.resetHighlightNeighbours();
                    }
                });
            }
        });
    }

    resetGraph() {
        if ( this.simulation) {
            this.simulation.alpha(0);
            this.simulation.nodes([]);
            this.simulation.force('link').links([]);
        }
        if ( this.context) {
            this.renderedNodes = [];
            this.renderedLinks = [];
            this.ticked();
        }
        this.graphService.activeNode.next(undefined);
        this.graphService.userNodeHighlight.next(undefined);
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.width = $('.d3-graph').width();
            this.height = $('.d3-graph').height();
            this.dpr = window.devicePixelRatio;
            console.log('device pixel ratio is ' + this.dpr);
            this.canvas = document.querySelector('.d3-graph');
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.context = this.canvas.getContext('2d');
        }
        if (this.simulation) {
            this.simulation.stop();
            this.simulation.stop();
            this.setSimulation().then( (simulation) => {
                this.context.beginPath();
                this.simulation = simulation;
            });
        }
    }

    init() {
        this.dpr = window.devicePixelRatio || 1;
        this.width = $('.d3-graph').width() * this.dpr;
        this.height = $('.d3-graph').height() * this.dpr;
        console.log('device pixel ratio is ' + this.dpr);
        this.canvas = document.querySelector('.d3-graph');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
        this.context.translate(0.5, 0.5);
        this.context.imageSmoothingEnabled = true;
        this.graphData.links.forEach( link => {
            link.opacity = 1;
            link.color = 0;
            link.target_id = link.target + '';
            link.source_id = link.source + '';
        });
        this.graphData.nodes.forEach( node => {
            node.out_degree = this.getNeighbours(node, 'out');
            node.degree = this.getNeighbours(node);
            node.r = this.scale(node.out_degree) * 1.6 * this.dpr;
            node.opacity = 1.0;
            node.color = 0;
        });
        this.setCenteredNode();
        this.setConnectedNodes();
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
                    .subject( () => this.getHoveredNode())
                    .on('start', () => this.dragstarted())
                    .on('drag', () => this.dragged())
                    .on('end', () => this.dragended()));
            // Hover behavior
            d3.select(this.canvas)
                .on('mousemove', () => {
                    const node = this.getHoveredNode();
                    if ( node && !this.hoveredNode) {
                        this.hoveredNode = node;
                        this.graphService.userNodeHighlight.next(node.id_str);
                    } else if ( !node
                                && this.hoveredNode
                                && !this.dragging) {
                        this.graphService.userNodeHighlight.next(undefined);
                    } else if ( node !== this.hoveredNode
                                && !this.dragging) {
                        this.hoveredNode = node;
                        this.graphService.userNodeHighlight.next(undefined);
                        this.graphService.userNodeHighlight.next(node.id_str);
                    }
                })
                .on('click', () => {
                    const node = this.getHoveredNode();
                    if ( node) {
                        this.graphService.activeNode.next(node.id_str);
                    } else {
                        this.graphService.activeNode.next(undefined);
                    }
                });
        });
    }

    getHoveredNode() {
        const mouse = d3.mouse(this.canvas);
        const x = this.getOriginalXPosition(mouse[0] * this.dpr);
        const y = this.getOriginalYPosition(mouse[1] * this.dpr);
        const node = this.simulation.find( x, y);
        if (node) {
            return this.simulation.find( x, y, node.r + (node.r / 7));
        } else {
            return undefined;
        }
    }

    setSimulation(): Promise<d3.forceSimulation> {
        return new Promise( (resolve, reject) => {
            this.renderedNodes.forEach( node => {
                if ( node.group === 0) {
                    node.fx = 0;
                    node.fy = 0;
                }
            });

            const simulation = d3.forceSimulation()
                .force('link', d3.forceLink().id(function(d) {
                    return d.id_str;
                    }).distance( function(d) {
                        const sourceRad = d.source.r;
                        const targetRad = d.target.r;
                        return (sourceRad + targetRad);
                    }))
                .force('charge', d3.forceManyBody().strength( (d) => {
                    return (d.r * 2) * -20;
                }))
                .force('collide', d3.forceCollide().radius( function(d) {
                    return d.r * 1.5;
                }));
                // .force('center', d3.forceCenter(0, 0));

            simulation
                .nodes( this.graphData.nodes)
                .on( 'tick', () => this.ticked());

            simulation.force('link')
                .links( this.graphData.links);
            resolve(simulation);
        });
    }

    setCenteredNode() {
        const source = this.graphData.nodes.filter( node => node['group'] === 0);
        if (source.length === 0) {
            source.push(this.graphData.nodes.sort( node => node['out_degree'])[0]);
        }
        this.centeredNode = source[0];
    }

    getShiftX(): number {
        const sortByX = this.connectedNodes
                            .map(node => node.x)
                            .sort( (a, b) => a - b);
        const xMin = sortByX[0];
        const xMax = sortByX[sortByX.length - 1];
        const shiftX = -((xMin + xMax) / 2);
        return shiftX;
    }
    getShiftY(): number {
        const sortByY = this.connectedNodes
                            .map(node => node.y)
                            .sort( (a, b) => a - b);
        const yMin = sortByY[0];
        const yMax = sortByY[sortByY.length - 1];
        const shiftY = -((yMin + yMax) / 2);
        return shiftY;
    }

    getFactor(): number {
        const xSpace = this.canvas.width;
        const ySpace = this.canvas.height;
        const sortByX = this.connectedNodes
                            .map(node => {
                                const nodeX = node.fx ? node.fx : node.x;
                                if (nodeX < 0) {
                                    return nodeX - node.r;
                                } else {
                                    return nodeX + node.r;
                                }
                            })
                            .sort( (a, b) => a - b);
        const sortByY = this.connectedNodes
                            .map(node => {
                                const nodeY = node.fy ? node.fy : node.y;
                                if (nodeY < 0) {
                                    return nodeY - node.r;
                                } else {
                                    return nodeY + node.r;
                                }
                            })
                            .sort( (a, b) => a - b);
        const xMin = sortByX[0];
        const xMax = sortByX[sortByX.length - 1];
        const yMin = sortByY[0];
        const yMax = sortByY[sortByY.length - 1];
        const x = xMax - xMin;
        const y = yMax - yMin;
        const xFactor = xSpace / x;
        const yFactor = ySpace / y;
        const factor = Math.min(xFactor, yFactor);
        if (factor < 1) {
            return factor;
        } else {
            return this.factor;
        }
    }

    getCanvasXPosition(x: number): number {
        return ((x + this.shiftX) * this.factor) + (this.canvas.width / 2);
    }

    getCanvasYPosition(y: number): number {
        return ((y + this.shiftY) * this.factor) + (this.canvas.height / 2);
    }

    getOriginalXPosition(cx: number): number {
        return ((cx - (this.canvas.width / 2)) / this.factor) - this.shiftX;
    }

    getOriginalYPosition(cy: number): number {
        return ((cy - (this.canvas.height / 2)) / this.factor) - this.shiftY;
    }

    setConnectedNodes(): void {
        if (this.centeredNode) {
            const connectedIds = new Set();
            const checkedIds = new Set();
            connectedIds.add(this.centeredNode['id_str']);
            const loop = setInterval( () => {
                connectedIds.forEach( id => {
                    if (!checkedIds.has(id)) {
                        checkedIds.add(id);
                        const neighbours = this.getNeighbourIds(id);
                        neighbours.forEach( neighbourId => {
                            connectedIds.add(neighbourId);
                        });
                    }
                }, 100);
                if (checkedIds.size === connectedIds.size) {
                    clearInterval(loop);
                    this.connectedNodes = this.graphData.nodes.filter( node => {
                        return connectedIds.has(node.id_str);
                    });
                }
            });
        }
    }

    ticked() {
        if (!this.dragging) {
            this.shiftX = this.getShiftX();
            this.shiftY = this.getShiftY();
        }
        this.factor = this.getFactor();

        this.renderedNodes.forEach( node => {
            node['cx'] = this.getCanvasXPosition(node.x);
            node['cy'] = this.getCanvasYPosition(node.y);
        });

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderedLinks.filter( link => link.opacity !== 1).forEach( link => {
            this.drawLink( link);
        });

        this.renderedNodes.filter( node => node.opacity !== 1).forEach(node => {
            if ( node.group === 1) {
                this.drawNode(node);
            } else {
                this.drawAuthor(node);
            }
        });

        this.renderedLinks.filter( link => link.opacity === 1).forEach( link => {
            this.drawLink( link);
        });

        this.renderedNodes.filter( node => node.opacity === 1).forEach(node => {
            if ( node.group === 1) {
                this.drawNode(node);
            } else {
                this.drawAuthor(node);
            }
        });
    }

    drawLink(d) {
        const targetRadius = d.target.r * this.factor;
        const angle = Math.atan2( d.target.cy - d.source.cy,
                                d.target.cx - d.source.cx);
        const xPos = d.target.cx - targetRadius * Math.cos(angle);
        const yPos = d.target.cy - targetRadius * Math.sin(angle);
        this.context.beginPath();
        this.context.moveTo(d.source.cx, d.source.cy);
        this.context.lineTo( xPos, yPos);
        this.context.strokeStyle = 'rgba(' + this.linkColors[d.color] + ',' + d.opacity + ')';
        this.context.lineWidth = 0.8;
        this.context.stroke();
        if ( this.settings.arrows) {
            this.drawHead(d, xPos, yPos, angle);
        }
    }

    drawHead(node, xPos, yPos, angle) {
        this.context.beginPath();
        this.context.moveTo(xPos, yPos);
        const headlen = 4;
        const headRightX = xPos - headlen * Math.cos(angle - Math.PI / 6);
        const headRightY = yPos - headlen * Math.sin(angle - Math.PI / 6);
        this.context.lineTo( headRightX, headRightY);
        this.context.moveTo( xPos, yPos);
        const headLeftX = xPos - headlen * Math.cos(angle + Math.PI / 6);
        const headLeftY = yPos - headlen * Math.sin(angle + Math.PI / 6);
        this.context.lineTo( headLeftX, headLeftY);
        this.context.strokeStyle = 'rgba(' + this.linkColors[1] + ',' + node.opacity + ')';
        this.context.lineWbidth = 1.5;
        this.context.stroke();
    }

    drawNode(d) {
        const lineWidth = 2 * this.factor;
        const radius = (d.r * this.factor) - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.cx + radius, d.cy);
        this.context.arc(d.cx, d.cy, radius, 0, 2 * Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = 'rgba(' + this.colors[d.color] + ',' + d.opacity + ')';
        this.context.strokeStyle = '#F5F6F7';
        this.context.fill();
        this.context.stroke();
    }

    drawAuthor(d) {
        d.color = 1;
        const lineWidth = (d.r / 2.2) * this.factor;
        const radius = (d.r * this.factor) - lineWidth;
        this.context.beginPath();
        this.context.moveTo( d.cx + radius, d.cy);
        this.context.arc(d.cx, d.cy, radius, 0, 2 * Math.PI);
        this.context.lineWidth = lineWidth;
        this.context.fillStyle = '#fff';
        this.context.strokeStyle = 'rgba(' + this.colors[d.color] + ',' + d.opacity + ')';
        this.context.fill();
        this.context.stroke();
    }

    addTimestamps() {
        this.graphData.nodes.forEach( node => {
            node.timestamp = Date.parse(node.retweet_created_at) / 1000;
        });
        this.graphData.nodes.sort( (a, b) => {
            return a.timestamp - b.timestamp;
        });
        const tweetTime = this.graphData.nodes[0].timestamp;
        const lastRetweetTime = this.graphData.nodes[this.graphData.nodes.length - 1].timestamp;
        const relTimestampList = [];
        this.graphData.nodes.forEach( node => {
            node.rel_timestamp = node.timestamp - tweetTime;
            relTimestampList.push(node.rel_timestamp);
        });
        const timeRange = lastRetweetTime - tweetTime;
        this.graphService.timeRange.next(timeRange);
        this.graphService.relTimestampList.next(relTimestampList);
    }

    getNeighbours(node, direction?): number {
        const matches = [];
        this.graphData.links.forEach( link => {
            if ( !direction || direction === 'in') {
                if ( link.target_id === node.id_str) {
                    matches.push(link);
                }
            }
            if ( !direction || direction === 'out') {
                if ( link.source_id === node.id_str) {
                    matches.push(link);
                }
            }
        });
        return matches.length;
    }

    getNeighbourIds(id): number[] {
        const matches = [];
        this.graphData.links.forEach( link => {
            if (link.target_id === id) {
                matches.push(link.source_id);
            }
            if (link.source_id === id) {
                matches.push(link.target_id);
            }
        });
        return matches;
    }

    highlightNeighbours( inputNode) {
        const matchParents = this.settings.lastHighlight;
        const matchChildren = this.settings.nextHighlight;

        this.graphData.links.forEach( link => {
            link.opacity = 0.2;
        });
        this.graphData.nodes.forEach( node => {
            node.opacity = 0.2;
        });

        if ( matchChildren) {
            this.graphData.links.forEach( link => {
                if ( link.source === inputNode) {
                    link.opacity = 1;
                    link.color = 1;
                    link.target.opacity = 1;
                    link.target.color = 2;
                }
            });
        }
        if ( matchParents) {
            this.graphData.links.forEach( link => {
                if ( link.target === inputNode) {
                    link.opacity = 1;
                    link.color = 1;
                    link.source.opacity = 1;
                    link.source.color = 2;
                }
            });
        }
        inputNode.opacity = 1;
        inputNode.color = 1;
        this.ticked();
    }

    resetHighlightNeighbours() {
        this.graphData.links.forEach( link => {
            link.color = 0;
            link.opacity = 1;
        });
        this.graphData.nodes.forEach( node => {
            node.color = 0;
            node.opacity = 1;
        });
        if ( this.activeNode) {
            this.highlightNeighbours(this.activeNode);
        }
        this.ticked();
    }

    dragstarted() {
        this.dragging = true;
        if ( !d3.event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    dragged() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    dragended() {
        this.dragging = false;
        if ( !d3.event.active) {
            this.simulation.alphaTarget(0);
        }
        const node = d3.event.subject;
        if ( node.group === 1 && !this.settings.fixedDrag) {
            node.fx = null;
            node.fy = null;
        } else if (node.group === 0 && !this.settings.fixedAuthor) {
            node.fx = null;
            node.fy = null;
        }
    }

    changeFixed() {
        this.graphData.nodes.forEach( node => {
            if ( node.group === 0) {
                if ( this.settings.fixedAuthor) {
                    node.fx = node.x;
                    node.fy = node.y;
                } else {
                    node.fx = null;
                    node.fy = null;
                }
            } else {
                if ( !this.settings.fixedDrag) {
                    node.fx = null;
                    node.fy = null;
                }
            }
        });
        if ( this.simulation) {
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
                if ( node.id_str === nodeId) {
                    resolve(node);
                }
            });
            reject();
        });
    }
}

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
    retweetsToTimeRendered: false;

    constructor(
        private communicationService: CommunicationService,
        private graphService: GraphService
    ) {
        this.communicationService.retweetCount.subscribe( retweetCount => {
            this.retweetCount = retweetCount;
            this.setRetweetsToTimeData();
        });
        this.graphService.graphData.subscribe( graphData => {
            if ( graphData) {
                this.graphData = graphData;
                this.setRetweetsToTimeData();
            }
        });
        this.communicationService.resetData.subscribe( reset => {
            if ( reset) {
                this.rendered.next(false);
            }
        });
    }

    setRetweetsToTimeData() {
        if ( this.retweetCount && this.graphData) {
            const retweetCount = this.retweetCount;
            const userCount = this.graphData['nodes'].length;
            const startPoint = retweetCount - userCount;
            const users = this.graphData['nodes'].map( (node, index) => {
                const user = {};
                user['id_str'] = node['id_str'];
                user['x'] = node['rel_timestamp'];
                if ( user['x'] === 0) {
                    user['y'] = index;
                } else {
                    user['y'] = startPoint + index;
                }
                user['timestamp'] = node['timestamp'];
                return user;
            });
            const lineGraphData = {};
            if ( retweetCount > 100) {
                lineGraphData['invalid'] = users.slice(0, 2);
                lineGraphData['valid'] = users.slice(1);
            } else {
                lineGraphData['valid'] = users;
            }
            lineGraphData['headline'] = 'Retweets by time';
            lineGraphData['info_text'] = 'Here you can see how up to the last 100 retweets evolved by time.';
            this.retweetsToTimeData = lineGraphData;
            this.rendered.next(true);
        }
    }

}

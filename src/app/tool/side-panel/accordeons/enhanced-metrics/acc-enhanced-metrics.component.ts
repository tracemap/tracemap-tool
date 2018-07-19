import { Component, Output, EventEmitter } from '@angular/core';

import { CommunicationService } from '../../../services/communication.service';
import { GraphService } from '../../../services/graph.service';
import { _MatTabHeaderMixinBase } from '@angular/material/tabs/typings/tab-header';

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
    retweetsToTimeRendered = false;

    usersByFollowersData: object;
    usersByFollowersRendered = false;

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
                this.getUserInfos().then( userInfos => {
                    this.setFollowersByUserData(userInfos);
                });
            }
        });
        this.communicationService.resetData.subscribe( reset => {
            if ( reset) {
                this.rendered.next(false);
            }
        });
    }

    getUserInfos(): Promise<object[]> {
        return new Promise( (res) => {
            const userInfos = [];
            userInfos.push(this.graphData['author_info']);
            Object.keys(this.graphData['retweet_info']).forEach( key => {
                userInfos.push(this.graphData['retweet_info'][key]);
            });
            res(userInfos);
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
            lineGraphData['info_text'] = 'Here you can see how up to the last 100 retweets evolved by time.<br>' +
                'A gap at the beginning of a line indicates, that the source Tweet has more than 100 retweets.';
            this.retweetsToTimeData = lineGraphData;
            this.rendered.next(true);
        }
    }

    setFollowersByUserData(userInfos: object[]) {
        const followersData = {};
        followersData['data'] = userInfos.map( user => user['followers_count']);
        followersData['headline'] = 'Users sorted by followers';
        followersData['info_text'] = 'Here you can see the users sorted by the amount of followers they got.<br>' +
            'You can check if the influential Users have many followers or if they are just well connected in this network.';
        this.usersByFollowersData = followersData;
    }

}

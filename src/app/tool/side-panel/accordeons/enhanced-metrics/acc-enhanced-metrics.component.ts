import { Component, Output, EventEmitter } from '@angular/core';

import { CommunicationService } from '../../../services/communication.service';
import { GraphService } from '../../../services/graph.service';

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

    usersByTweetsData: object;
    usersByTweetsDataRendered = false;

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
                    this.setTweetsByUserData(userInfos);
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
            this.communicationService.userInfo.subscribe( (info: object[]) => {
                if (info) {
                    const userInfoList = Object.keys(info).map( key => {
                        return info[key];
                    });
                    res(userInfoList);
                }
            });
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
            lineGraphData['info_text'] = 'Here you can see how the last 100 retweets evolved in time.<br>' +
                'A data gap will be present at the origin when the source tweet has more than 100 retweets.';
            this.retweetsToTimeData = lineGraphData;
            this.rendered.next(true);
        }
    }

    setFollowersByUserData(userInfos: object[]) {
        const followersData = {};
        followersData['data'] = userInfos
            .map( user => {
            return {
                uid: user['id_str'],
                value: user['followers_count']
            };
        }).sort( (a, b) => b.value - a.value);
        followersData['headline'] = 'Users sorted by followers';
        followersData['info_text'] = 'Here you can see the users sorted by the total amount of followers they have.<br>' +
            'You can check if the influential users actually have many followers or if they are just well connected within this tracemap.';
        this.usersByFollowersData = followersData;
    }

    setTweetsByUserData(userInfos: object[]) {
        const tweetsData = {};
        tweetsData['data'] = userInfos
            .map( user => {
            return {
                uid: user['id_str'],
                value: user['statuses_count']
            };
        }).sort( (a, b) => b.value - a.value);
        tweetsData['headline'] = 'Users sorted by authored tweets';
        tweetsData['info_text'] = 'Here you can see the users sorted by the amount of tweets they authored.<br>' +
            'You can check who tweets a lot compared to their outreach.';
        this.usersByTweetsData = tweetsData;
    }
}

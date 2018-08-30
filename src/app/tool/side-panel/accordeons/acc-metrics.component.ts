import { Component, Output, EventEmitter } from '@angular/core';

import { GraphService } from '../../services/graph.service';
import { CommunicationService } from '../../services/communication.service';

@Component({
    selector: 'acc-metrics',
    templateUrl: './acc-metrics.component.html',
    styleUrls: ['./acc-metrics.component.scss']
})

export class AccMetricsComponent {
    @Output()
    rendered = new EventEmitter();

    graphData: object;

    tracemapMetrics = {
            avg_links: undefined,
            user_number: undefined,
            propagation_delay: undefined
    };
    userMetrics = {
        avg_followers: undefined,
        avg_followees: undefined,
        avg_age: undefined,
        avg_tweets: undefined,
        pc_verified: undefined
    };

    tracemapMetricsRendered = false;
    userMetricsRendered = false;

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService
    ) {
        Promise.all([this.propagationDelay, this.graphDataMetrics]).then(() => {
            this.rendered.next(true);
        });
        this.userDataMetrics.then(() => {
            this.rendered.next(true);
        });
        this.communicationService.resetData.subscribe( resetData => {
            if ( resetData) {
                this.userMetricsRendered = false;
                this.tracemapMetricsRendered = false;
            }
        });
    }
    propagationDelay = new Promise( (res) => {
        this.graphService.relTimestampList.subscribe( timestampList => {
            if ( timestampList) {
                const timestamp = timestampList[Math.floor(timestampList.length / 2)];
                this.tracemapMetrics.propagation_delay = timestamp;
                res();
            }
        });
    });

    graphDataMetrics = new Promise( (res) => {
        this.graphService.graphData.subscribe( graphData => {
            if ( graphData) {
                this.graphData = graphData;
                const promAvgLinks = new Promise( (resolve) => {
                    const linkCount = graphData['links'].length;
                    const nodeCount = graphData['nodes'].length;
                    const avgLinks = linkCount / nodeCount;
                    this.tracemapMetrics.avg_links = avgLinks;
                    resolve();
                });

                const promUserNumber = new Promise( (resolve) => {
                    const userNumber = graphData['nodes'].length;
                    this.tracemapMetrics.user_number = userNumber;
                    resolve();
                });

                Promise.all([
                    promAvgLinks,
                    promUserNumber,
                ]).then( () => {
                    this.tracemapMetricsRendered = true;
                    res();
                });

            }
        });
    });

    userDataMetrics = new Promise( (res) => {
        this.graphService.nodeList.subscribe( nodeList => {
            if ( nodeList) {
                const nodeIds = nodeList.map( node => node['id_str']);
                this.communicationService.userInfo.subscribe( userInfos => {
                    this.communicationService.userInfosLoaded.next(true);
                    let userCount = 0;
                    let followers = 0;
                    let followees = 0;
                    let tweets = 0;
                    let age = 0;
                    const currentTime = Date.now();
                    Object.keys(userInfos).forEach( key => {
                        const user = userInfos[key];
                        userCount += 1;
                        followers += user['followers_count'];
                        followees += user['friends_count'];
                        tweets += user['statuses_count'];
                        const creationDate = Date.parse(user['created_at']);
                        age += currentTime - creationDate;
                    });
                    const avgFollowers = Math.floor(followers / userCount);
                    const avgFollowees = Math.floor(followees / userCount);
                    const avgTweets = Math.floor(tweets / userCount);
                    const avgAge = (age / userCount);
                    this.userMetrics.avg_followers = avgFollowers;
                    this.userMetrics.avg_followees = avgFollowees;
                    this.userMetrics.avg_tweets = avgTweets;
                    this.userMetrics.avg_age = avgAge;
                    this.userMetricsRendered = true;
                    res();
                });
            }
        });
    });
}

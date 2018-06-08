import { Component, Output, EventEmitter } from '@angular/core';

import { GraphService } from './../../services/graph.service';

@Component({
    selector:'acc-metrics',
    templateUrl:'./acc-metrics.component.html',
    styleUrls:['./acc-metrics.component.scss']
})

export class AccMetricsComponent {
    @Output()
    rendered = new EventEmitter();

    graphData: object;
    
    tracemapMetrics = {
            avg_links: undefined,
            user_number: undefined,
            propagation_delay: undefined
    }
    userMetrics = {
        avg_followers: undefined,
        avg_followees: undefined,
        avg_age: undefined,
        avg_tweets: undefined,
        pc_verified: undefined
    }

    tracemapMetricsRendered = false;
    userMetricsRendered = false;

    constructor(
        private graphService: GraphService
    ){
        Promise.all([this.propagationDelay, this.graphDataMetrics]).then(() => {
            this.tracemapMetricsRendered = true;
            this.rendered.next(true);
        })
        this.userDataMetrics.then(() => {
            this.userMetricsRendered = true;
            this.rendered.next(true);
        })
    }

    propagationDelay = new Promise( (res) => {
        this.graphService.relTimestampList.subscribe( timestampList => {
            if( timestampList) {
                let timestamp = timestampList[Math.floor(timestampList.length / 2)];
                this.tracemapMetrics.propagation_delay = timestamp;
                res();
            }
        })
    })

    graphDataMetrics = new Promise( (res) => {
        this.graphService.graphData.subscribe( graphData => {
            if( graphData) {
                this.graphData = graphData;
                let promAvgLinks = new Promise( res => {
                    let linkCount = graphData["links"].length;
                    let nodeCount = graphData["nodes"].length;
                    let avgLinks = linkCount / nodeCount;
                    this.tracemapMetrics.avg_links = avgLinks;
                    res();
                })

                let promUserNumber = new Promise( res => {
                    let userNumber = graphData["nodes"].length;
                    this.tracemapMetrics.user_number = userNumber;
                    res();
                })

                Promise.all([
                    promAvgLinks,
                    promUserNumber,
                ]).then( () => res());

            }
        })
    })

    userDataMetrics = new Promise( (res) => {
        this.graphService.userInfo.subscribe( userInfo => {
            if( userInfo) {
                let userCount = 0;
                let followers = 0;
                let followees = 0;
                let tweets = 0;
                let age = 0;
                let currentTime = Date.now();
                Object.keys(userInfo).forEach( key => {
                    let user = userInfo[key];
                    userCount += 1;
                    followers += user["followers_count"];
                    followees += user["friends_count"];
                    tweets += user["statuses_count"];
                    let creationDate = Date.parse(user["created_at"]);
                    age += currentTime - creationDate;
                })
                let avgFollowers = Math.floor(followers / userCount);
                let avgFollowees = Math.floor(followees / userCount);
                let avgTweets = Math.floor(tweets / userCount);
                let avgAge = (age / userCount);
                this.userMetrics.avg_followers = avgFollowers;
                this.userMetrics.avg_followees = avgFollowees;
                this.userMetrics.avg_tweets = avgTweets;
                this.userMetrics.avg_age = avgAge;
                res();
            }
        }) 
    })
}

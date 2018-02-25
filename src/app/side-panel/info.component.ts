import { Component, Output, EventEmitter } from '@angular/core';
import { ApiService } from './../api.service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

import { MainCommunicationService } from './../main.communication.service';
import { HighlightService } from './../highlight.service';

import * as $ from 'jquery';

@Component({
  selector: 'tm-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {

    highlightDetails: string;
    highlightInfluent: string;
    tracemapData: object;
    graphData: object;
    subscription: Subscription;
    infoData: object = {};

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private comService: MainCommunicationService,
        private highlightService: HighlightService
    ) {
        this.apiService.tracemapData.subscribe( tracemapData => {
            if(tracemapData){
                this.tracemapData = tracemapData;
                this.setAvgAccountAge();
            }
        });
        this.apiService.graphData.subscribe( graphData => {
            if( graphData) {
                this.graphData = graphData;
                this.setNodeNumber();
                this.setLinkNumber();
                this.setAuthorUnknown();
                this.setAvgDegree();
                this.setInfluentialUsers();
            }
        });
        this.comService.userNodeHighlight.subscribe( userId => {
            $('.' + userId).addClass("active");
        });
        this.comService.resetUserNodeHighlight.subscribe( userId => {
            $('.' + userId).removeClass("active");
        });
        this.highlightService.highlight.subscribe( area => {
            if( area == "tm-details") {
                this.highlightDetails = "highlight";
            } else {
                this.highlightDetails = "";
            }
            if( area == "tm-influent") {
                this.highlightInfluent = "highlight";
            } else {
                this.highlightInfluent = "";
            }
        });
    }

    setNodeNumber(): void {
        let tweetInfo = this.tracemapData['tweet_data']['tweet_info'];
        let retweetCount = tweetInfo['retweet_count'];
        let links = this.graphData['links'];
        let tmNodes = new Set();
        links.forEach( link => {
            tmNodes.add( link['source']);
            tmNodes.add( link['target']);
        });
        if( retweetCount > 100){
            retweetCount = 100;
        }
        this.infoData['retweet_count'] = retweetCount;
        this.infoData['node_count'] = tmNodes.size;
    }

    setLinkNumber():void {

        let linkCount = this.graphData['links'].length;
        this.infoData['link_count'] = linkCount;
    }

    setAvgAccountAge(): void {
        let retweeterIds = this.tracemapData['tweet_data']['retweeter_ids'];
        let retweetInfos = this.tracemapData['tweet_data']['retweet_info'];
        let sumAgeSeconds = 0;
        retweeterIds.forEach( retweeter => {
            let userInfo = retweetInfos[retweeter]['user'];
            let age = (Date.now() - Date.parse(userInfo['created_at']))/1000;
            sumAgeSeconds += age;
        });
        let avgAge;
        if( sumAgeSeconds > 365 * 24 * 60 * 60){
            avgAge = sumAgeSeconds / (365 * 24 * 60 * 60) / retweeterIds.length;
            this.infoData['avg_age'] = Number((avgAge).toFixed(1)) + " Years"
        } else if (sumAgeSeconds > 30 * 24 * 60 * 60){
            avgAge = sumAgeSeconds / (30 * 24 * 60 * 60) / retweeterIds.length;
            this.infoData['avg_age'] = Number((avgAge).toFixed(1)) + " Months"
        } else {
            avgAge = sumAgeSeconds / (24 * 60 * 60) / retweeterIds.length;
            this.infoData['avg_age'] = Number((avgAge).toFixed(0)) + " Days"
        }
    }

    setAvgDegree(): void {
        let linkCount = this.graphData['links'].length;
        let nodeCount = this.infoData['node_count'];
        this.infoData['avg_degree'] = (linkCount / nodeCount).toFixed(1);
    }

    setInfluentialUsers(): void {
        let links = this.graphData['links'];
        let users = this.tracemapData['tweet_data']['retweeter_ids'];
        let author = this.tracemapData['tweet_data']['tweet_info']['user']
        if ( users.indexOf(author['id_str']) < 0) {
            users.push(author['id_str']);
        };
        let usersDegreeDict = {};
        users.forEach( user => {
            usersDegreeDict[user] = 0;
        });
        links.forEach( link => {
            //The link['source'] value changes over time from string to
            // dict. 
            let sourceId = "";
            if( link['source'] instanceof Object){
               sourceId = link['source']['id_str'];
            } else {
                sourceId = link['source'];
            }
            usersDegreeDict[sourceId] = usersDegreeDict[sourceId] + 1;
        });
        let topUsersDegreeList = [];
        let avgDegree = this.infoData['avg_degree'];
        users.forEach(user => {
            let userDegree = usersDegreeDict[user];
            if( userDegree > avgDegree) {
                topUsersDegreeList.push({
                    'id_str': user,
                    'degree':userDegree
                });
            }
        });
        let sortedTopUsers = topUsersDegreeList.sort( ( a, b) => {
            return b['degree'] - a['degree'];
        })
        topUsersDegreeList.forEach( user => {
            let userId = user['id_str'];
            let retweetInfo = this.tracemapData['tweet_data']['retweet_info'];
            let userInfo;
            if( retweetInfo[userId]) {
                userInfo = retweetInfo[userId]['user'];
            } else {
                userInfo = author;
            }
            user['user_info'] = userInfo;
        });
        if(sortedTopUsers.length > 8) {
            sortedTopUsers = sortedTopUsers.slice(0,8);
        }
        this.infoData['influential_users'] = sortedTopUsers;
    }

    setAuthorUnknown(): void {
        if( this.graphData['author_unknown']) {
            this.infoData['author_unknown'] = true;

        }
    }

    highlightUserNode( userId: string): void {
        this.comService.userNodeHighlight.next(userId);
    }

    resetHighlightUserNode( userId: string): void {
        this.comService.resetUserNodeHighlight.next(userId);
    }

    openUserDetails( userId: string): void {
        this.comService.resetUserNodeHighlight.next( userId);
        this.comService.userInfo.next( userId);
    }
}

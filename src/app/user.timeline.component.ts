import { Component } from '@angular/core';

import { ApiService } from './api.service';
import { TweetService } from './tweet.service';
import { MainCommunicationService } from './main.communication.service';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { Observer } from 'rxjs/Observer';

import * as $ from 'jquery';

@Component({
    selector: 'timeline',
    templateUrl: 'user.timeline.component.html',
    styleUrls: ['user.timeline.component.scss']
})

export class UserTimelineComponent {
    userId: string;
    timelineData: {};
    timeline: string[] = [];
    renderedTweets = new Set;

    loaded: boolean = false;

    selection: string;
    sortBy: string = "retweets";
    include: string = "_no_rts";

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private tweetService: TweetService,
        private comService: MainCommunicationService
    ){
        this.route.params.subscribe(
            (params: Params) => {
                this.loaded = false;
                this.userId = params['uid'];
                this.timeline = []
                this.apiService.getTimeline( this.userId)
                    .subscribe( timeline => {
                        this.timelineData = timeline;
                        this.changeSelection(this.sortBy);
                });
            }
        )

    }

    changeSelection(value:any): void {
        this.renderedTweets.clear();
        if( value == 'time' || value == 'retweets') {
            this.sortBy = value;
        } else {
            if(value) {
                this.include = "";
            } else {
                this.include = "_no_rts";
            }
        }
        this.selection = "by_" + this.sortBy + this.include;
        this.timeline = [];
        this.addTweets();
    }

    addTweets(): void {
        let length = this.timeline.length;
        let addNum = 0;
        let diff = this.timelineData[this.selection].length - length;
        if(diff > 5){
            addNum = 5;
        } else {
            addNum = diff;
        }
        if(addNum > 0){
            let sub_timeline = this.timelineData[this.selection].slice( length,
                                                                        length + addNum);
            sub_timeline.forEach( (tweet, index) => {
                let tweetId: string;
                if( tweet.retweeted) {
                    tweetId = tweet.retweeted;
                } else {
                    tweetId = tweet.id_str;
                }
                this.timeline[index + length] = tweetId;
            });
        } 
    }

    changeTracemap(tweetId: string): void {
        this.router.navigate(['twitter',tweetId]);
    }

    onScroll(event: any): void {
        console.log(this.timeline.length);
        console.log(this.renderedTweets.size);
        if( this.timeline.length == this.renderedTweets.size){
            let timelineHeight = event.target.scrollTopMax;
            let scrollPosition = event.target.scrollTop;
            if( timelineHeight - scrollPosition < 100) {
               this.addTweets();
            }
        }
    }

    tweetRendered(tweetId: string): void {
        $('button.' + tweetId).css('visibility','visible');
        this.renderedTweets.add(tweetId);
        if(this.renderedTweets.size > 4 || this.renderedTweets.size == this.timeline.length) {
            this.loaded = true;
        }
    }
}
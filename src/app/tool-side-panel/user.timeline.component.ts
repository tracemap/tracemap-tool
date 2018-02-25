import { Component } from '@angular/core';

import { ActivatedRoute, Router, Params } from '@angular/router';

import { ApiService } from './../services/api.service';
import { HighlightService } from './../services/highlight.service';

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

    highlight: string;
    loaded: boolean = false;

    selection: string;
    sortBy: string = "retweets";
    include: string = "_no_rts";

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private highlightService: HighlightService
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
        this.highlightService.highlight.subscribe( area => {
            if( area == "timeline") {
                this.highlight = "highlight";
            } else {
                this.highlight = "";
            }
        });
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
        if( this.timeline.length == this.renderedTweets.size){
            let timelineHeight = event.target.scrollHeight;
            let scrollPosition = event.target.scrollTop +
                                 event.target.offsetHeight;
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

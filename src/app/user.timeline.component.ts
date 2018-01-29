import { Component } from '@angular/core';

import { ApiService } from './api.service';
import { TweetService } from './tweet.service';
import { MainCommunicationService } from './main.communication.service';
import { ActivatedRoute } from '@angular/router';

import { Observer } from 'rxjs/Observer';

@Component({
    selector: 'timeline',
    templateUrl: 'user.timeline.component.html',
    styleUrls: ['user.timeline.component.scss']
})

export class UserTimelineComponent {
    userId: string;
    timelineData: {};
    timeline: string[] = [];

    selection: string;
    sortBy: string = "time";
    include: string = "";


    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private tweetService: TweetService,
        private comService: MainCommunicationService
    ){
        this.userId = this.route.params["_value"]["uid"];
        this.apiService.getTimeline( this.userId)
            .subscribe( timeline => {
                this.timelineData = timeline;
                this.changeSelection(true);
            });
    }

    changeSelection(value:any): void {
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
                this.timeline[index + length] = tweet.id_str;
            });
        } 
    }


}
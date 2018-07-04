import { Component, Input, OnChanges } from '@angular/core';

import { ApiService } from './../../../services/api.service';
@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent implements OnChanges {

    @Input('userId')
    userId: string;
    timeline: object[]; // complete tweet list from backend
    timelineSorted: object[] = []; // timeline sorted by user settings
    timelineShowed: object[] = []; // subset of timelineSorted loaded in batches
    constructor(
        private apiService: ApiService
    ) {}

    ngOnChanges() {
        if ( this.userId) {
            this.apiService.getTimeline(this.userId).subscribe( (timeline: object[]) => {
                timeline.forEach( tweet => {
                    if (tweet['retweeted_status']) {
                        tweet['valid_id_str'] = tweet['retweeted_status']['id_str'];
                    } else {
                        tweet['valid_id_str'] = tweet['id_str'];
                    }
                    tweet['rendered'] = false;
                });
                this.timeline = timeline;
                this.timelineSorted = timeline;
                this.addShowedTweets();
            });
        }
    }

    addShowedTweets(): void {
        const renderedLength = this.timelineShowed.length;
        const timelineLength = this.timelineSorted.length;
        const newLength = renderedLength + 10 >= timelineLength ? timelineLength : renderedLength + 10;
        this.timelineShowed = this.timelineSorted.slice( 0, newLength);
        console.log(this.timelineShowed);
    }

    setTweetRendered( event, tweet: object): void {
        tweet['rendered'] = true;
        console.log('this is triggered');
    }
}

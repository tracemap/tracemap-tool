import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';

import { ApiService } from './../../../services/api.service';
import { GraphService } from './../../services/graph.service';
import { CommunicationService } from './../../services/communication.service';

@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent implements OnChanges {
    @Output()
    rendered = new EventEmitter();
    @Input('userId')
    userId: string;
    tweetId: string;

    timeline: object[]; // complete tweet list from backend
    timelineSorted: object[] = []; // timeline sorted by user settings
    timelineShowed: object[] = []; // subset of timelineSorted loaded in batches
    timelineRendered: string[] = [];
    constructor(
        private apiService: ApiService,
        private communicationService: CommunicationService
    ) {
        this.communicationService.tweetId.subscribe( tweetId => {
            this.tweetId = tweetId;
        });
    }

    ngOnChanges() {
        if ( this.userId) {
            this.timeline = undefined;
            this.timelineSorted = [];
            this.timelineShowed = [];
            this.timelineRendered = [];
            this.apiService.getTimeline(this.userId).subscribe( (timeline: object[]) => {
                timeline.forEach( tweet => {
                    if (tweet['retweeted_status']) {
                        tweet['valid_id_str'] = tweet['retweeted_status']['id_str'];
                    } else {
                        tweet['valid_id_str'] = tweet['id_str'];
                    }
                    tweet['rendered'] = false;
                    if ( tweet['valid_id_str'] === this.tweetId) {
                        tweet['disabled'] = true;
                    }
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
    }

    setTweetRendered( tweet: object): void {
        this.timelineRendered.push( tweet['valid_id_str']);
        tweet['rendered'] = true;
        if (this.allTweetsRendered) {
            this.rendered.next(true);
        }
    }

    allTweetsRendered(): boolean {
        const renderedLength = this.timelineRendered.length;
        const showedLength = this.timelineShowed.length;
        return renderedLength === showedLength;
    }
}

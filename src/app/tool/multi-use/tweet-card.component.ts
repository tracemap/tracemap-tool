import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'tweet-card',
    templateUrl: './tweet-card.component.html',
    styleUrls: ['./tweet-card.component.scss']
})

export class TweetCardComponent implements OnChanges {
    @Input()
    tweetId: string;
    @Input()
    retweetCount: number;
    @Input()
    disabled: boolean;
    @Output()
    rendered = new EventEmitter();

    cardRendered = false;

    constructor(
        private apiService: ApiService
    ) {}

    ngOnChanges() {
        if ( this.tweetId && !this.retweetCount) {
            this.apiService.getTweetInfo(this.tweetId).subscribe( response => {
                if (response) {
                    // retweetCount is checked in template before rendered holds true
                    // as a workaround to not show tweets which are not existing (anymore)
                    this.retweetCount = response[this.tweetId]['retweet_count'];
                }
            });
        }
    }

    tweetRendered( tweetId: string) {
        this.cardRendered = true;
        this.rendered.next(tweetId);
    }

}

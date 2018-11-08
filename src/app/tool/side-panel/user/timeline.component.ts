import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/api.service';
import { WordcloudService } from '../../services/wordcloud.service';
import { CommunicationService } from '../../services/communication.service';

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
    filterWord: string;
    emptyTimeline = false;

    settings = {
        sort_by: 'time',
        retweets: true
    };

    timeline: object[]; // complete tweet list from backend
    timelineSorted: object[] = []; // timeline sorted by user settings
    timelineShowed: object[] = []; // subset of timelineSorted loaded in batches
    timelineRendered: string[] = [];
    constructor(
        private apiService: ApiService,
        private communicationService: CommunicationService,
        private wordcloudService: WordcloudService,
    ) {
        this.communicationService.tweetId.subscribe( tweetId => {
            this.tweetId = tweetId;
        });
    }

    ngOnChanges() {
        if ( this.userId) {
            this.rendered.next(false);
            this.reset();
            this.apiService.getTimeline(this.userId).subscribe( (timeline: object[]) => {
                // unify tweet_ids for twitter widget script
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
                // filter retweets of own tweets
                timeline = timeline.filter( tweet => {
                    if ( !tweet['retweeted_status'] ||
                    tweet['user']['id_str'] !== tweet['retweeted_status']['user']['id_str']) {
                        return tweet;
                    }
                });
                this.timeline = timeline;
                this.communicationService.timelineSettings.subscribe( settings => {
                    if (settings) {
                        let sortChanged = false;
                        let filterChanged = false;

                        Object.keys(settings).forEach( key => {
                            if (this.settings[key] !== settings[key]) {
                                this.settings[key] = settings[key];
                                if (key === 'sort_by') {
                                    sortChanged = true;
                                } else if (key === 'retweets') {
                                    filterChanged = true;
                                }
                            }
                        });
                        if (filterChanged) {
                            this.resort(true);
                        } else if (sortChanged) {
                            this.resort();
                        }
                    }
                });
                this.wordcloudService.selectedWord.subscribe( word => {
                    if (this.filterWord && !word) {
                        this.filterWord = undefined;
                        this.resort();
                    } else if (word && this.filterWord !== word) {
                        this.filterWord = word;
                        this.resort();
                    }
                });
                this.resort(true);
            });
        }
    }

    reset(): void {
        this.timelineShowed = [];
        this.timelineSorted = undefined;
        this.timelineRendered = [];
        this.emptyTimeline = false;
    }

    resort(updateWordcloud = false): void {
        if (this.timeline) {
            this.reset();
            this.timelineSorted = this.timeline.slice();
            if (this.settings.sort_by === 'retweets') {
                this.timelineSorted.sort( (a, b) => {
                    return b['retweet_count'] - a['retweet_count'];
                });
            }
            if ( !this.settings.retweets) {
                this.timelineSorted = this.timelineSorted.filter( tweet => !tweet['retweeted_status']);
            }
            if (updateWordcloud) {
                this.sendWordcloudTexts(this.timelineSorted);
            }
            if (this.filterWord) {
                this.timelineSorted = this.timelineSorted.filter( (tweet) => {
                    const text = tweet['full_text'];
                    return text.indexOf(this.filterWord) >= 0;
                });
            }
            this.addShowedTweets();
        }
    }

    addShowedTweets(): void {
        const showedLength = this.timelineShowed.length;
        const timelineLength = this.timelineSorted.length;
        const newLength = showedLength + 10 >= timelineLength ? timelineLength : showedLength + 10;
        this.timelineShowed = this.timelineSorted.slice( 0, newLength);
        if (this.timelineShowed.length === 0) {
            this.rendered.next(true);
            this.emptyTimeline = true;
        }
    }

    sendWordcloudTexts(timeline): void {
        const timelineTexts = timeline.map( (d) => d['full_text']);
        this.wordcloudService.timelineTexts.next( timelineTexts);

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

import { Component, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'tweet',
    templateUrl: './tweet.component.html',
    styleUrls: ['./tweet.component.scss']
})

export class TweetComponent implements OnChanges {
    @Output()
    rendered = new EventEmitter();
    @Input('tweetId')
    tweetId: string;
    @Input('cards')
    cards = true;

    @ViewChild('tweetElement') tweetElement: ElementRef;

    ngOnChanges() {
        if ( this.tweetId) {
            window['twttr'].ready( twttr => {
                const domTweet = this.tweetElement.nativeElement;
                // Remove old tweet if present
                if (domTweet.firstChild) {
                    domTweet.removeChild( domTweet.firstChild);
                }
                if ( this.cards) {
                    // Create tweet from tweetId
                    twttr.widgets.createTweet(
                        this.tweetId,
                        domTweet,
                        {
                            width: '308px',
                            linkColor: '#9729ff'
                        }
                    ).then(() => {
                        // Callback to parent for timeline loading animation
                        this.rendered.emit(this.tweetId);
                    });
                } else {
                    // Create tweet from tweetId
                    twttr.widgets.createTweet(
                        this.tweetId,
                        domTweet,
                        {
                            linkColor: '#9729ff',
                            cards: 'hidden',
                            width: '308px'
                        }
                    ).then(() => {
                        // Callback to parent for timeline loading animation
                        this.rendered.next(this.tweetId);
                    });
                }
            });
        }
    }
}

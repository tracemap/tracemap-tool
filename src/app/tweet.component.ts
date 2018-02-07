import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'tweet',
    templateUrl: './tweet.component.html',
    styleUrls: ['./tweet.component.scss']
}) 

export class TweetComponent implements OnChanges{
    @Output()
    rendered = new EventEmitter();
    @Input('tweetId') 
    tweetId: string;

    ngOnChanges() {
        if( this.tweetId) {
            window['twttr'].ready( twttr => {
                let domTweet = document.getElementsByClassName(this.tweetId)[0];
                // Remove old tweet if present
                if( domTweet.firstChild) {
                    domTweet.removeChild( domTweet.firstChild);
                }
                // Create tweet from tweetId
                twttr.widgets.createTweet(
                    this.tweetId,
                    domTweet,
                    {
                        linkColor: "#9729ff"
                    }
                ).then(() => {
                    // Callback to parent for timeline loading animation
                    this.rendered.emit(this.tweetId);
                });
            });
        }
    }


}
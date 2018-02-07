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

                        twttr.widgets.createTweet(
                            this.tweetId,
                            document.getElementsByClassName(this.tweetId)[0],
                            {
                                linkColor: "#9729ff",
                            }
                        ).then(() => {
                            this.rendered.emit(this.tweetId);
                        });
                    });
        }
    }


}
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TweetService } from './tweet.service';

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
    html: String;
    processed:boolean = false;
    twitter: any;

    constructor(
        private tweetService: TweetService,
        private router: Router
    ) { 
        window['twttr'].ready(
            twttr => {
                twttr.events.bind(
                    'rendered',
                    event => {
                        event.target.parentNode.classList.remove("unrendered");
                        this.rendered.emit(this.tweetId);
                    }
                );
            }
        )
    }

    ngOnChanges() {
        if( this.tweetId) {
            this.tweetService.getHtml(this.tweetId)
                .then( html => {
                    document.getElementsByClassName('tweet')[0]
                            .classList.add('unrendered');
                    this.html = html;
                    // setTimeout(fn,0) guarantees. that widgets.load
                    // takes place after the this.html is rendered
                    setTimeout(() => {
                        window['twttr'].widgets.load(
                            document.getElementsByTagName('tweet')
                        );
                    }, 0);
                });
        }
    }


}
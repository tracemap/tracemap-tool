import { Component, Input, OnChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TweetService } from './tweet.service';

import * as $ from 'jquery';

@Component({
    selector: 'tweet',
    templateUrl: './tweet.component.html',
    styleUrls: ['./tweet.component.scss']
}) 

export class TweetComponent implements OnChanges{

    @Input('tweetId') 
    tweetId: string;
    html: String;
    processed:boolean;
    twitter: any;

    constructor(
        private tweetService: TweetService,
        private router: Router
    ) { 
    }

    ngOnChanges() {
        if( this.tweetId) {
            this.tweetService.getHtml(this.tweetId)
                .then( html => {
                    this.html = html; 
                    this.initTwitterWidget();
                });
        }
    }

    initTwitterWidget() {
        window['twttr'] = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window['twttr'] || {};
            if (d.getElementById(id)){
                let unrendered = $('tweet blockquote');
                console.log(unrendered);
                t.widgets.load(unrendered);
                $('timeline .tweet').css('opacity',1);
                return t;
            };
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;
        })(document, "script", "twitter-wjs");

        window['twttr'].ready(
            twttr => {
                twttr.events.bind(
                    'rendered',
                    event => {
                        console.log("renderer!");
                        event.target.parentNode.classList.add('rendered');
                    }
                );
            }
        );
    }

}
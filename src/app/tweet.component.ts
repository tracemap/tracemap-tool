import { Component, Input, AfterViewInit, OnChanges } from '@angular/core';

import { TweetService } from './tweet.service';

@Component({
    selector: 'tweet',
    templateUrl: './tweet.component.html',
    styleUrls: ['./tweet.component.scss']
}) 

export class TweetComponent implements OnChanges{

    @Input('tweetId') 
    tweetId: string;
    html: String;
    processed:boolean = false;

    constructor(
        private tweetService: TweetService
    ) { }

    ngOnChanges() {
        if( this.tweetId) {
            this.tweetService.getHtml(this.tweetId)
                .then( html => {
                    this.html = html;
                    console.log(this.html);
                    this.loadWidgetsJs();
                    this.processed = true;
                });
        }
    }


    loadWidgetsJs () {
        !function(d,s,id){
            var js: any,
                fjs=d.getElementsByTagName(s)[0];
            if(!d.getElementById(id)){
                js=d.createElement(s);
                js.id=id;
                js.src="https://platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js,fjs);
            }
        }
        (document,"script","twitter-wjs");
    }
}
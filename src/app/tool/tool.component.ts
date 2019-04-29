import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { CommunicationService } from './services/communication.service';
import { LocalStorageService } from './services/local-storage.service';
import { LoggingService } from './services/logging.service';
import { TwitterDataService } from './services/twitter-data.service';

@Component({
    selector: 'tool',
    templateUrl: './tool.component.html',
    styleUrls: ['./tool.component.scss']
})

export class ToolComponent implements OnInit {

    tweetId: string;
    cookiePolicyOpen = false;
    // Show if more than 100 retweets
    exceedOverlayOpen = false;

    constructor(
        private route: ActivatedRoute,
        private communicationService: CommunicationService,
        private localStorageService: LocalStorageService,
        private twitterDataService: TwitterDataService,
        private loggingService: LoggingService
    ) {
        this.loadTwitterWidgetScript();

        const cookieSettings = this.localStorageService.getSettings();
        if ( !cookieSettings) {
            this.localStorageService.showPolicy.next(true);
            this.communicationService.firstTimeVisitor.next(true);
        } else {
            this.communicationService.cookieOverlayClosed.next(true);
        }
        this.localStorageService.showPolicy.subscribe( showPolicy => {
            if ( !showPolicy) {
                this.cookiePolicyOpen = false;
                this.communicationService.cookieOverlayClosed.next(true);
            } else {
                this.cookiePolicyOpen = true;
            }
        });
        this.twitterDataService.isSet.subscribe( isSet => {
            if (isSet) {
                this.exceedOverlayOpen = this.twitterDataService.retweetCount > 100;
            }
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe( (params: Params) => {
            if (this.tweetId !== params['tid']) {
                this.tweetId = params['tid'];
                this.communicationService.resetData.next(true);
                this.communicationService.tweetId.next(params['tid']);
                this.loggingService.startTracemapGeneration(this.tweetId);
                this.twitterDataService.setTwitterData(this.tweetId);
            }
        });
    }

    closeExceedOverlay(): void {
        this.exceedOverlayOpen = false;
        this.communicationService.exceedOverlayClosed.next(true);
    }

    loadTwitterWidgetScript(): void {
        window['twttr'] = (function(d, s, id) {
            let js, fjs = d.getElementsByTagName(s)[0],
                t = window['twttr'] || {};
            if (d.getElementById(id)) {
                return t;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;
        }(document, 'script', 'twitter-wjs'));
    }
}

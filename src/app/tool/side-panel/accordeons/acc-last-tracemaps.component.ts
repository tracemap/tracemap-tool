import { Component, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { LocalStorageService } from './../../services/local-storage.service';

@Component({
    selector: 'acc-last-tracemaps',
    templateUrl: './acc-last-tracemaps.component.html',
    styleUrls: ['./acc-last-tracemaps.component.scss']
})

export class AccLastTracemapsComponent {
    @Output()
    rendered = new EventEmitter(false);

    history: string[];
    fullHistory: string[];
    cookieEnabled: boolean;
    tweetId: string;
    historyRendered = [];

    constructor(
        private localStorageService: LocalStorageService,
        private route: ActivatedRoute
    ){
        let settings = this.localStorageService.getSettings()
        if( settings && settings["cookie"] && settings["lastTracemaps"]) {
            this.cookieEnabled = true;
        }
        this.route.params.subscribe( (params: Params) => {
            if( this.tweetId != params["tid"]) {
                this.tweetId = params["tid"];

                if( !this.fullHistory) {
                    let lastTracemaps = this.localStorageService.getLastTracemaps();
                    if( lastTracemaps) {
                        this.fullHistory = lastTracemaps["ids"];
                    } else {
                        this.fullHistory = [];
                    }
                }

                if( this.fullHistory) {
                    let validHistory = this.fullHistory.filter( (id) => id != this.tweetId);
                    if( validHistory.length > 10) {
                        validHistory = validHistory.slice(10);
                    }
                    this.history = validHistory;
                }

                this.fullHistory = [this.tweetId].concat(this.history);
                let storageObject = {'ids': this.fullHistory};
                this.localStorageService.setLastTracemaps(storageObject);
                if( this.history.length == 0 || !this.history) {
                    setTimeout( () => {
                        this.rendered.next(true);
                    }, 1000);
                }
            }
        });
    } 

    openCookiePolicy() {
        this.localStorageService.showPolicy.next(true);
    }

    addRenderedCard(tweetId: string) {
        if( tweetId) {
            this.historyRendered.push(tweetId)
        }
        if( this.historyRendered.length == this.history.length) {
            this.rendered.next(true);
        }
    }
}

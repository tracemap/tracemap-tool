import { Component, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ActivatedRoute, Params } from '@angular/router';

import { CommunicationService } from '../../services/communication.service';
import { TwitterDataService } from '../../services/twitter-data.service';

@Component({
    selector: 'acc-source',
    templateUrl: './acc-source.component.html',
    styleUrls: ['./acc-source.component.scss']
})

export class AccSourceComponent {
    @Output()
    rendered = new EventEmitter();

    tweetId: string;
    retweetCount: number;

    constructor(
        private twitterDataService: TwitterDataService,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe( (params: Params) => {
            if ( this.tweetId !== params['tid']) {
                this.rendered.next(false);
            }
            this.tweetId = params['tid'];
        });
        this.twitterDataService.isSet.subscribe( isSet => {
            if ( isSet) {
                this.retweetCount = this.twitterDataService.retweetCount;
                this.rendered.next(true);
            }
        });
    }


}

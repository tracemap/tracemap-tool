import { Component, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ActivatedRoute, Params } from '@angular/router';

import { CommunicationService } from './../../services/communication.service';

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
        private communicationService: CommunicationService,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe( (params: Params) => {
            if( this.tweetId){
                this.rendered.next(false);
            }
            this.tweetId = params["tid"];
        })
        this.communicationService.retweetCount.subscribe( retweetCount => {
            if( retweetCount) {
                this.retweetCount = retweetCount;
                this.rendered.next(true);
            }
        })
    }

    
}

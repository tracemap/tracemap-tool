import { Component, Input, OnChanges } from '@angular/core';

import { ApiService } from './../../../services/api.service';
@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent implements OnChanges {

    @Input('userId')
    userId: string;

    constructor(
        private apiService:ApiService
    ){}

    ngOnChanges() {
        if( this.userId) {
            this.apiService.getTimeline(this.userId).subscribe( timeline => {
                // console.log(timeline);
            })
        }
    }
}

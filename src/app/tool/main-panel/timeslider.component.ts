import { Component, NgModule } from '@angular/core';

import { GraphService } from './../services/graph.service';

import * as $ from 'jquery';


@Component({
    selector: 'timeslider',
    templateUrl: './timeslider.component.html',
    styleUrls: ['./timeslider.component.scss']
})

export class TimesliderComponent {
    circlePos = 0;
    range: number;
    label: number;
    unit;
    value = 0;
    factor;
    stepSize;

    constructor(
        private graphService: GraphService
    ) {
        this.graphService.timeRange.subscribe( timeRange => {
            this.range = timeRange;
            this.stepSize = Math.floor(timeRange / 100);
            this.addLabelUnit();
            this.graphService.timesliderPosition.next(0);
        })
    }

    addLabelUnit() {
        let range = this.range;
        let minutes = this.range / 60;
        let hours = minutes / 60;
        let days = hours / 24;
        if( hours > 100) {
            this.label = Math.floor(hours / 24);
            this.unit = "DAYS";
            this.factor = 1 / 60 / 60 / 24;
        } else if ( minutes > 600){
            this.label = Math.floor(hours);
            this.unit = "HOURS";
            this.factor = 1 / 60 / 60
        } else {
            this.label = Math.floor(minutes);
            this.unit = "MINUTES";
            this.factor = 1 / 60;
        }
    }

    formatThumbLabel(value) {
        return value * this.factor;
    }
    onChange() {
        console.log(this.value);
        this.graphService.timesliderPosition.next(this.value);
    }

}

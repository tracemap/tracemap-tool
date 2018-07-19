import { Component, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

import { GraphService } from '../services/graph.service';
import { CommunicationService } from '../services/communication.service';

import * as $ from 'jquery';


@Component({
    selector: 'timeslider',
    templateUrl: './timeslider.component.html',
    styleUrls: ['./timeslider.component.scss']
})

export class TimesliderComponent {
    circlePos = 0;
    range: number;
    endLabel;
    unit;
    value = 0;
    factor;
    stepSize;
    moving;
    hintConfig = {
        text: '',
        x: 0,
        y: 0
    };
    timer;
    autoSlideSubscription;
    relTimestampList: number[];

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService
    ) {
        this.graphService.timeRange.subscribe( timeRange => {
            this.range = timeRange;
            this.stepSize = Math.floor(timeRange / 300);
            this.endLabel = this.getLabelFormat(this.range);
            this.value = 0;
            this.graphService.timesliderPosition.next(0);

        });
        this.graphService.relTimestampList.subscribe( relTimestampList => {
            this.relTimestampList = relTimestampList;
        });
        this.graphService.rendered.subscribe( rendered => {
            if ( rendered) {
                this.autoSlide();
            }
        });
        this.communicationService.resetData.subscribe( reset => {
            if ( reset) {
                if (this.autoSlideSubscription) {
                    this.autoSlideSubscription.unsubscribe();
                    this.value = 0;
                }
            }
        });
    }

    getLabelFormat( value) {
        const minutes = value / 60;
        const hours = minutes / 60;
        const days = hours / 24;

        const result = {
            value: 0,
            unit: '',
        };
        if ( hours > 100) {
            result.value = Math.floor(hours / 24);
            result.unit = 'DAYS';
        } else if ( minutes > 120) {
            result.value = Math.floor(hours);
            result.unit = 'HOURS';
        } else if ( value > 59) {
            result.value = Math.floor(minutes);
            result.unit = 'MINUTES';
        } else {
            result.value = Math.floor(value);
            result.unit = 'SECONDS';
        }
        return result;
    }

    changeValue(slider) {
        if ( this.autoSlideSubscription) {
            this.autoSlideSubscription.unsubscribe();
        }
        const value = slider._value;
        this.value = value;
        this.graphService.timesliderPosition.next(this.value);
        this.addLabel();
    }

    addLabel() {
        const slider = $('.slider');
        const position = slider.position();
        const x = position.left;
        const y = position.top;
        const width = slider.width();
        const thumbPosition = x + (width * (this.value / this.range));
        const labelTextDict = this.getLabelFormat(this.value);
        this.hintConfig.x = thumbPosition;
        this.hintConfig.y = y;
        this.hintConfig.text =  labelTextDict.value + ' ' + labelTextDict.unit.toLowerCase();
        this.moving = true;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout( () => {
            this.moving = false;
        }, 2000);
    }

    autoSlide() {
        this.communicationService.noOverlayOpen().then( () => {
            this.autoSlideSubscription = Observable.interval(100).subscribe( i => {
                this.value = this.relTimestampList[i];
                this.graphService.timesliderPosition.next(this.value);
                this.addLabel();
                if ( this.relTimestampList.length === i + 1) {
                    this.autoSlideSubscription.unsubscribe();
                }
            });
        });
    }
}

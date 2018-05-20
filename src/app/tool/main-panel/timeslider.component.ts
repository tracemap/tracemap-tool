import { Component, AfterViewInit } from '@angular/core';

import * as $ from 'jquery';

@Component({
    selector: 'timeslider',
    templateUrl: './timeslider.component.html',
    styleUrls: ['./timeslider.component.scss']
})

export class TimesliderComponent implements AfterViewInit {
    circlePos = 0;
    width;

    ngAfterViewInit() {
        this.width = $('.slider').width();
    }

    moveHandle(event) {
        this.circlePos = event.clientX - 356 - 60 - 60 - 10;
    }

    slideHandle(event) {
        document.onmousemove = (event2) => {
            this.circlePos = event2.clientX - 356 - 60 - 60 - 10;
            if(this.circlePos > this.width) {
                this.circlePos = this.width
            } else if (this.circlePos < 0){
                this.circlePos = 0;
            }
        };
        document.onmouseup = (event3) => {
            document.onmousemove = null;
        }
    }
}

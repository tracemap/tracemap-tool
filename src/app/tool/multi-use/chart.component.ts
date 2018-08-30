import { Component, Input } from '@angular/core'

import * as d3 from 'd3';

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
})

export class ChartComponent {
    @Input('data')
    data: object;

    open = true;

    constructor(){
    }
}

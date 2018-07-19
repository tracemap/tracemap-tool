import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './acc-bar-chart.component.html',
    styleUrls: ['./chart.component.scss']
})

export class EnhancedBarChartComponent {
    @Input('data')
    data: object;

    @Output('rendered')
    rendered = new EventEmitter(false);
}

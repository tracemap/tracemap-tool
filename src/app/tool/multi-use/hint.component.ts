import { Component, Input } from '@angular/core';

@Component({
    selector: 'hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss']
})

export class HintComponent {
    @Input('config')
    config;
    // config = {
    //     text: "",
    //     arrowPos: "",
    //     x: "",
    //     y: ""
    // };

}

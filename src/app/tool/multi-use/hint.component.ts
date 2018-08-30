import { Component, Input } from '@angular/core';

@Component({
    selector: 'hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss']
})

export class HintComponent {
    @Input('config')
    config;
    @Input('text')
    text;
    @Input('arrowPos')
    arrowPos;
    // config = {
    //     text: "",
    //     arrowPos: "",
    //     x: "",
    //     y: ""
    // };
    // or
    // text = ""
    // arrowPos = "",
}

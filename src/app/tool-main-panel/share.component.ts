import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss']
})

export class ShareComponent {

    tracemapUrl: string;

    constructor(
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe( params => {
            this.tracemapUrl = window.location.href.replace("localhost","tool.tracemap.info");
        })
    }
}
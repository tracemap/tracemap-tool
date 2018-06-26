import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss']
})

export class ShareComponent {
    open = false;
    tracemapUrl: string;
    hovered: undefined;

    constructor(
        private route: ActivatedRoute
    ){
        this.route.params.subscribe( params => {
            this.tracemapUrl = window.location.href.replace("localhost:4200","tracemap.info");
        })
    }

    openOverlay() {
        this.open = true;
    }

    closeOverlay() {
        this.open = false;
    }

    highlight(element=undefined) {
        this.hovered = element;
    }
}

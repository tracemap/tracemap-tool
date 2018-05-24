import { Component } from '@angular/core';

import { GraphService } from './../services/graph.service';
@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: [
        './../multi-use/tooltip.component.scss',
        './settings.component.scss']
})

export class SettingsComponent {

    open = false;
    settings = {
        arrows: true,
        leafs: true,
        lastHighlight: true,
        nextHighlight: true,
        fixedDrag: true,
        fixedAuthor: true
    }

    constructor(
        private graphService: GraphService
    ){}

    openSettings() {
        this.open = true;
    }

    closeSettings() {
        this.open = false;
    }

    updateSettings() {
        this.graphService.settings.next(this.settings);
    }
}

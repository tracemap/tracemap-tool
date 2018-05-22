import { Component } from '@angular/core';

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
        fixedDrag: true
    }

    openSettings() {
        this.open = true;
    }

    closeSettings() {
        this.open = false;
    }
}

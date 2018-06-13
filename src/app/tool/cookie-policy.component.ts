import { Component } from '@angular/core';

import { LocalStorageService } from './services/local-storage.service';

@Component({
    selector: 'cookie-policy',
    templateUrl: 'cookie-policy.component.html',
    styleUrls: ['cookie-policy.component.scss']
})

export class CookiePolicyComponent {

    settings = {
        cookie: true,
        graph: true,
        lastTracemaps: true
    }

    applied = false;

    constructor(
        private localStorageService: LocalStorageService
    ) {
        let settings = this.localStorageService.getSettings();
        if( settings) {
            this.settings.cookie = settings["cookie"];
            this.settings.graph = settings["graph"];
            this.settings.lastTracemaps = settings["lastTracemaps"];
        }
    }

    saveSettings() {
        this.localStorageService.setSettings(this.settings);
        this.applied = true;
        setTimeout( () => {
            this.localStorageService.showPolicy.next(false);
        }, 500);
    }
}

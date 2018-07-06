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
        lastTracemaps: true,
        timeline: true
    };

    applied = false;

    constructor(
        private localStorageService: LocalStorageService
    ) {
        const settings = this.localStorageService.getSettings();
        if (settings) {
            Object.keys(this.settings).forEach( key => {
                if ( settings[key]) {
                    this.settings[key] = settings[key];
                }
            });
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

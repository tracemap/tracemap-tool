import { Component } from '@angular/core';

import { GraphService } from '../services/graph.service';
import { LocalStorageService } from '../services/local-storage.service';
import { TourService } from '../services/tour.service';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./../multi-use/tooltip.scss', './settings.component.scss']
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
    };

    constructor(
        private graphService: GraphService,
        private localStorageService: LocalStorageService,
        private tourService: TourService
    ) {
        const settings = this.localStorageService.getGraphSettings();
        if ( settings) {
            Object.keys(settings).forEach( key => {
                this.settings[key] = settings[key];
            });
            this.updateSettings();
        }

        this.tourService.graphSettingsOpen.subscribe( (open) => {
            if (open !== undefined) {
                if (open) {
                    this.openSettings();
                } else {
                    this.closeSettings();
                }
            }
        });
    }

    openSettings() {
        this.open = true;
    }

    closeSettings() {
        this.open = false;
    }

    updateSettings() {
        this.graphService.settings.next(this.settings);
        this.localStorageService.setGraphSettings(this.settings);
    }

    openCookiePolicy() {
        this.localStorageService.showPolicy.next(true);
    }
}

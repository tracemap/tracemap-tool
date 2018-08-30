import { Component } from '@angular/core';
import { MatRadioChange } from '@angular/material';

import { LocalStorageService } from '../../services/local-storage.service';
import { CommunicationService } from '../../services/communication.service';
import { TourService } from '../../services/tour.service';

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})

export class UserSettingsComponent {

    open = false;
    settings = {
        sort_by: 'time',
        retweets: true
    };

    constructor(
        private localStorageService: LocalStorageService,
        private communicationService: CommunicationService,
        private tourService: TourService
    ) {
        const settings = this.localStorageService.getTimelineSettings();
        console.log('timeline settings: ' + settings);
        if (settings) {
            Object.keys(settings).forEach( key => {
                this.settings[key] = settings[key];
            });
            this.updateTimelineSettings();
        }

        this.tourService.userSettingsOpen.subscribe( open => {
            if (open) {
                this.open = true;
            } else {
                this.open = false;
            }
        });
    }
    toggleMenu(): void {
        this.open ? this.open = false : this.open = true;
    }

    updateTimelineSettings(): void {
        this.communicationService.timelineSettings.next(this.settings);
        this.localStorageService.setTimelineSettings(this.settings);
    }

    updateTimelineSorting( event: MatRadioChange): void {
        if (event.value !== this.settings.sort_by) {
            this.settings.sort_by = event.value;
            this.updateTimelineSettings();
        }
    }

}

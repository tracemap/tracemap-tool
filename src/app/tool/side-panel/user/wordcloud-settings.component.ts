import { Component } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { CommunicationService } from '../../services/communication.service';

@Component({
    selector: 'app-wordcloud-settings',
    templateUrl: './wordcloud-settings.component.html',
    styleUrls: ['./user-settings.component.scss',
                './wordcloud-settings.component.scss']
})

export class WordcloudSettingsComponent {
    open = false;
    settings = {
        words: true,
        handles: true,
        hashtags: true
    };

    constructor(
        private localStorageService: LocalStorageService,
        private communicationService: CommunicationService,
    ) {
        const settings = this.localStorageService.getWordcloudSettings();
        if (settings) {
            Object.keys(settings).forEach( key => {
                this.settings[key] = settings[key];
            });
            this.updateWordcloudSettings();
        }
    }

    toggleMenu(): void {
        this.open ? this.open = false : this.open = true;
    }

    updateWordcloudSettings(): void {
        this.communicationService.wordcloudSettings.next(this.settings);
        this.localStorageService.setWordcloudSettings(this.settings);
    }
}

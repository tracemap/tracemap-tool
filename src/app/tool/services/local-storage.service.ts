import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class LocalStorageService {

    showPolicy = new BehaviorSubject<boolean>(undefined);

    settings = {
        cookie: false,
        graph: false,
        lastTracemaps: false,
        timeline: false,
        wordcloud: false
    };

    constructor() {
        const settings = this.retrieve('cookie');
        if ( settings) {
            Object.keys(settings).forEach( key => {
                this.settings[key] = settings[key];
            });
        }
    }

    private store(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    private retrieve(key): object {
        const stringDict = localStorage.getItem(key);
        if ( stringDict == null) {
            return undefined;
        } else {
            try {
                return JSON.parse(stringDict);
            } catch (e) {
                this.remove(key);
                return {};
            }
        }
    }

    private remove(key) {
        localStorage.removeItem(key);
    }

    setSettings(settings: object) {
        Object.keys(settings).forEach( key => {
            this.settings[key] = settings[key];
        });
        if ( this.settings.cookie) {
            this.store('cookie', this.settings);
        }
        Object.keys(this.settings).forEach( key => {
            if (this.settings[key] === false) {
                this.remove(key);
            }
        });
    }

    getSettings(): object {
        const userSettings = this.retrieve('cookie');
        // Check if the cookie policy changed since
        // the user accepted last time
        let missingSetting = false;
        Object.keys(this.settings).forEach( key => {
            if ( !userSettings || userSettings[key] === undefined) {
                missingSetting = true;
            }
        });
        // If not return cookie settings
        return missingSetting ? undefined : userSettings;
    }

    setGraphSettings(config: object) {
        if ( this.settings.graph) {
            this.store('graph', config);
        }
    }

    getGraphSettings(): object {
        return this.retrieve('graph');
    }

    setLastTracemaps( tracemapList: object) {
        if ( this.settings.lastTracemaps) {
            this.store('lastTracemaps', tracemapList);
        }
    }

    getLastTracemaps(): object {
        return this.retrieve('lastTracemaps');
    }

    setTimelineSettings( config: object) {
        if (this.settings.timeline) {
            this.store('timeline', config);
        }
    }

    getTimelineSettings(): object {
        return this.retrieve('timeline');
    }

    setWordcloudSettings( config: object) {
        if (this.settings.wordcloud) {
            this.store('wordcloud', config);
        }
    }

    getWordcloudSettings(): object {
        return this.retrieve('wordcloud');
    }
}

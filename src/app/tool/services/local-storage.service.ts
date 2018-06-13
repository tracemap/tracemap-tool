import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class LocalStorageService {

    showPolicy = new BehaviorSubject<boolean>(undefined);

    settings = {
        cookie: false,
        graph: false,
        lastTracemaps: false,
    }

    constructor(){
        let settings = this.retrieve("settings");
        if( settings) {
            Object.keys(settings).forEach( key => {
                this.settings[key] = settings[key];
            })
        }
    }

    private store(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    private retrieve(key):object {
        let stringDict = localStorage.getItem(key);
        if( stringDict == null) {
            return undefined;
        }
        else {
            try {
                return JSON.parse(stringDict);
            }
            catch (e) {
                console.log("Destroying corrupt browser storage...")
                this.remove(key);
                return {};
            }
        }
    }

    private remove(key) {
        localStorage.removeItem(key);
    }

    setSettings(settings:object) {
        Object.keys(settings).forEach( key => {
            this.settings[key] = settings[key];
        })
        if( this.settings.cookie) {
            this.store("cookie", this.settings);
        }
        Object.keys(this.settings).forEach( key => {
            if (this.settings[key] == false) {
                this.remove(key);
            }
        })
    }

    getSettings(): object {
        return this.retrieve("cookie");
    }

    setGraphSettings(config:object) {
        if( this.settings.graph) {
            this.store("graph", config);
        }
    }

    getGraphSettings() {
        return this.retrieve("graph");
    }

    setLastTracemaps( tracemapList: object) {
        if( this.settings.lastTracemaps) {
            this.store("lastTracemaps", tracemapList);
        }
    }

    getLastTracemaps() {
        return this.retrieve("lastTracemaps");
    }
}

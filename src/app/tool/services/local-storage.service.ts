import { Injectable } from '@angular/core';

@Injectable( )

export class LocalStorageService {

    private store(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    private retrieve(key): any {
        let stringDict = localStorage.getItem(key);
        if( stringDict == null) {
            return {}
        }
        else {
            try {
                return JSON.parse(stringDict);
            }
            catch (e) {
                console.log("Destroying corrupt browser storage...")
                localStorage.removeItem(key);
                return {};
            }
        }
    }

    setD3Config(config:object) {
        this.store("d3", config);
    }

    getD3Config() {
        return( this.retrieve("d3"));
    }

    setTimelineConfig(config:object) {
        this.store("timeline", config);
    }

    getTimelineConfig() {
        return( this.retrieve("timeline"));
    }
}

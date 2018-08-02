import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiService } from '../../services/api.service';
import { reject } from 'q';

@Injectable( )

export class CommunicationService {

    retweetCount = new BehaviorSubject<number>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
    userId = new BehaviorSubject<string>(undefined);
    tweetId = new BehaviorSubject<string>(undefined);
    cookieOverlayClosed = new BehaviorSubject<boolean>(undefined);
    exceedOverlayClosed = new BehaviorSubject<boolean>(undefined);
    userInfosLoaded = new BehaviorSubject<boolean>(false);

    userInfo = new BehaviorSubject<object>(undefined);
    timelineSettings = new BehaviorSubject<object>(undefined);

    constructor(
        private apiService: ApiService
    ) {}

    getUserInfo(userId): Promise<object> {
        return new Promise( (res, rej) => {
            this.userInfo.subscribe( info => {
                if (info) {
                    try {
                        res(info[userId]);
                    } catch {
                        rej();
                    }
                }
            });
        });
    }

    noOverlayOpen(): Promise<void> {
        return new Promise( res => {
            this.cookieOverlayClosed.subscribe( cookieOverlayClosed => {
                if (cookieOverlayClosed) {
                    this.exceedOverlayClosed.subscribe( exceedOverlayClosed => {
                        if ( exceedOverlayClosed) {
                            res();
                        }
                    });
                }
            });
        });
    }
}

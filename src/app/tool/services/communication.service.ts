import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiService } from './../../services/api.service';

@Injectable( )

export class CommunicationService {

    constructor(
        private apiService: ApiService
    ) {}
    retweetCount = new BehaviorSubject<number>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
    userId = new BehaviorSubject<string>(undefined);
    tweetId = new BehaviorSubject<string>(undefined);
    cookieOverlayClosed = new BehaviorSubject<boolean>(undefined);
    exceedOverlayClosed = new BehaviorSubject<boolean>(undefined);

    userInfo = new BehaviorSubject<object>(undefined);
    oldUserInfo = {};
    timelineSettings = new BehaviorSubject<object>(undefined);

    getUserInfo(userIds): Promise<object> {
        return new Promise( (resolve) => {
            let input = [];
            if ( typeof userIds === 'string' || userIds instanceof String) {
                input.push(userIds);
            } else {
                input = userIds;
            }
            const userInfos = {};
            const unknown = [];
            input.forEach( userId => {
                const userInfo = this.oldUserInfo[userId];
                if ( userInfo) {
                    userInfos[userId] = userInfo;
                } else {
                    unknown.push(userId);
                }
            });
            if ( unknown.length === 0) {
                resolve( userInfos);
            } else {
                this.apiService.getUserInfo(unknown.toString()).subscribe( apiUserInfos => {
                    Object.keys(apiUserInfos).forEach( key => {
                        const userInfo = apiUserInfos[key];
                        this.oldUserInfo[key] = userInfo;
                        userInfos[key] = userInfo;
                    });
                    resolve(userInfos);
                });
            }
        });
    }

    noOverlayOpen(): Promise<void> {
        return new Promise( res => {
            this.cookieOverlayClosed.subscribe( cookieOverlayClosed => {
                if (cookieOverlayClosed) {
                    console.log('cookieOverlayClosed');
                    this.exceedOverlayClosed.subscribe( exceedOverlayClosed => {
                        if ( exceedOverlayClosed) {
                            console.log('exceedOverlayClosed');
                            res();
                        }
                    });
                }
            });
        });
    }
}

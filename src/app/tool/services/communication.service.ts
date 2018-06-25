import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiService } from './../../services/api.service';

@Injectable( )

export class CommunicationService {

    constructor(
        private apiService: ApiService
    ){}
    retweetCount = new BehaviorSubject<number>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
    userId = new BehaviorSubject<string>(undefined);

    userInfo = new BehaviorSubject<object>(undefined);
    oldUserInfo = {};
    getUserInfo(userIds): Promise<object> {
        return new Promise( (resolve) => {
            let input = [];
            if( typeof userIds == 'string' || userIds instanceof String) {
                input.push(userIds);
            } else {
                input = userIds;
            }
            let userInfos = {};
            let unknown = [];
            input.forEach( userId => {
                let userInfo = this.oldUserInfo[userId];
                if( userInfo) {
                    userInfos[userId] = userInfo;
                } else {
                    unknown.push(userId);
                }
            })
            if( unknown.length == 0) {
                resolve( userInfos);
            } else {
                this.apiService.getUserInfo(unknown.toString()).subscribe( apiUserInfos => {
                    Object.keys(apiUserInfos).forEach( key => {
                        let userInfo = apiUserInfos[key];
                        this.oldUserInfo[key] = userInfo;
                        userInfos[key] = userInfo;
                    })
                    resolve(userInfos);
                }) 
            }
        })
    }
}

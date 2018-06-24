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

    userInfo = {};
    getUserInfo(userIds): Promise<object> {
        return new Promise( (resolve) => {
            let userInfos = {};
            let unknown = [];
            userIds.forEach( userId => {
                let userInfo = this.userInfo[userId];
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
                        this.userInfo[key] = userInfo;
                        userInfos[key] = userInfo;
                    })
                    resolve(userInfos);
                }) 
            }
        })
    }
}

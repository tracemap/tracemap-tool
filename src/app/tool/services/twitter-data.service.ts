import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiService } from '../../services/api.service';
import { CommunicationService } from './communication.service';


@Injectable()

export class TwitterDataService {
    isSet = new BehaviorSubject<boolean>(false);
    retweetObjects: object;
    tweetObject: object;
    retweetIds: string[];
    retweetCount: number;

    userInfos: object;

    constructor(
        private apiService: ApiService,
        private communicationService: CommunicationService
    ) {
        this.communicationService.resetData.subscribe( reset => {
            if (reset) {
                this.isSet.next(false);
            }
        });
    }

    setTwitterData(tweetId: string): void {
        this.apiService.getTweetData(tweetId).subscribe( response => {
            console.log(response);
            this.retweetObjects = response['retweet_info'];
            this.tweetObject = response['tweet_info'];
            this.retweetIds = response['retweeter_ids'];
            this.retweetCount = response['retweeter_ids'].length;
            this.isSet.next(true);
            this.setUserInfos();
        });
    }

    setUserInfos(): void {
        const userInfos = {};
        this.retweetIds.forEach(retweetId => {
            userInfos[retweetId] = this.retweetObjects[retweetId]['user'];
        });
        const authorId = this.tweetObject['user']['id_str'];
        userInfos[authorId] = this.tweetObject['user'];
        this.userInfos = userInfos;
    }

    getUserInfo(userId: string): object {
        if (this.userInfos) {
            return this.userInfos[userId];
        } else {
            return undefined;
        }
    }
}

import { Component } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ApiService } from './api.service';
import { Subscription } from  'rxjs/Subscription';


@Component({
  selector: 'user-info',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})

export class UserComponent {

    subscription: Subscription;
    userId: string;
    userInfo: object;
    usersInfo: object;
    userImage: string;
    accountAge: string;
    counts: object;

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        // subscribes changed routes to switch userInfo
        this.apiService.tracemapData.subscribe( tracemapData => {
            if(tracemapData){
                this.usersInfo = tracemapData['tweet_data']['retweet_info'];
                let creatorId = tracemapData['tweet_data']['tweet_info']['user']['id_str'];
                let creatorInfo = tracemapData['tweet_data']['tweet_info'];
                this.usersInfo[creatorId] = creatorInfo;
                router.events.subscribe(() => this.changeUser());
                //For hardlinks
                if( !this.userId){
                    this.changeUser();
                }
            }
        });
    }

    changeUser(): void {
        let newUser = this.route.params["_value"]["uid"];
        if( newUser !== this.userId){
            this.userId = newUser;
            this.userInfo = this.usersInfo[this.userId]['user'];
            this.userImage = "https://twitter.com/" + this.userInfo['screen_name'] + "/profile_image?size=original"
            this.setAge();
            this.setCounts();
        }
    }

    setAge(): void {
        let now = Date.now()/1000;
        let created = Date.parse(this.userInfo['created_at'])/1000;
        let age = now - created;
        if(age > 365 * 24 * 60 * 60){
            age = age / (365 * 24 * 60 * 60);
            this.accountAge = Number((age).toFixed(1)) + " Years"
        } else if (age > 30 * 24 * 60 * 60){
            age = age / (30 * 24 * 60 * 60);
            this.accountAge = Number((age).toFixed(1)) + " Months"
        } else {
            age = age / (24 * 60 * 60);
            this.accountAge = Number((age).toFixed(0)) + " Days"
        }
    }

    setCounts(): void {
        let statuses = this.userInfo['statuses_count'];
        let followers = this.userInfo['followers_count'];
        let friends = this.userInfo['friends_count'];
        this.counts = {};

        if( statuses >= 100000) {
            this.counts['statuses_count'] = (statuses / 1000).toFixed(0) + 'K'; 
        } else {
            this.counts['statuses_count'] = String(statuses);
        }
        if( followers >= 100000) {
            this.counts['followers_count'] = (followers / 1000).toFixed(0) + 'K';
        } else {
            this.counts['followers_count'] = String(followers);
        }
        if( friends >= 100000) {
            this.counts['friends_count'] = (friends / 1000).toFixed(0) + 'K';
        } else {
            this.counts['friends_count'] = String(friends);
        }
    }

}
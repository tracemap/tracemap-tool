import { Component, OnChanges } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Observable';
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

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // subscribes changed routes to switch userInfo
        this.apiService.tracemapData.subscribe( tracemapData => {
            if(tracemapData){
                this.usersInfo = tracemapData['tweet_data']['retweet_info'];
                let creatorId = tracemapData['tweet_data']['tweet_info']['user']['id_str'];
                let creatorInfo = tracemapData['tweet_data']['tweet_info'];
                this.usersInfo[creatorId] = creatorInfo;
                router.events.subscribe(() => this.changeUser());
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
            console.log(this.userInfo);
            this.userImage = "https://twitter.com/" + this.userInfo['screen_name'] + "/profile_image?size=original"
            this.setAge();
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

}
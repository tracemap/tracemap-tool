import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'user-info',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {

    userId: string;
    userInfo: object;
    userImage: string;
    accountAge: string;

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // subscribes changed routes to switch userInfo
        router.events.subscribe(() => this.changeUser());
    }

    changeUser(): void {
        let newUser = this.route.params["_value"]["uid"];
        if( newUser !== this.userId){
            this.userId = newUser;
            this.apiService.getUserInfo( this.userId).subscribe( response => {
                this.userInfo = response[this.userId];
                this.userImage = "https://twitter.com/" + this.userInfo['screen_name'] + "/profile_image?size=original"
                this.setAge();
                console.log(this.userInfo);

            });
        }
    }

    setAge(): void {
        let now = Date.now()/1000;
        let created = Date.parse(this.userInfo['created_at'])/1000;
        console.log(now);
        console.log(created);
        let age = now - created;
        console.log(age);
        if(age > 365 * 24 * 60 * 60){
            age = age / (365 * 24 * 60 * 60);
            console.log(age);
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
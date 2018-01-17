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
                console.log( response[this.userId]);
            });
        }
    }

}
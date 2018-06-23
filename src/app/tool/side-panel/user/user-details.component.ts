import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { CommunicationService } from './../../services/communication.service';

@Component({
    selector: 'user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})

export class UserDetailsComponent {

    userId: string;

    constructor(
        private route: ActivatedRoute,
        private communicationService: CommunicationService
    ){
        this.route.params.subscribe( (params:Params) => {
            if( params["uid"] && this.userId != params["uid"]) {
                this.userId = params["uid"];
            } 
        })
    }

}

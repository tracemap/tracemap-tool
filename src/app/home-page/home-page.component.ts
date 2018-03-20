import { Component } from '@angular/core';

import { MainCommunicationService } from './../services/main.communication.service';

@Component({
	selector: 'home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.scss']
})

export class HomePageComponent {

    errorMsg:string[];

    constructor(
        private comService: MainCommunicationService
    ){
        this.comService.backendError.subscribe( error => {
            if( error) {
                this.errorMsg = ["Connection to our Server is not possible.",
                                "Please try again later."];
            } else {
                this.errorMsg = undefined;
            }
        });
    }
}

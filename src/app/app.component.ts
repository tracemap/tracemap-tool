import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { MainCommunicationService } from './services/main.communication.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'TraceMap';
    searchClasses = {}

    constructor(
        private router: Router,
        private comService: MainCommunicationService,
        private apiService: ApiService
    ){
        this.apiService.getTweetInfo( "975834710495645696").subscribe( (data) => {
        }, (error) => {
            if( error.type == 3) {
                console.log("Connection to backend not possible.");
                this.comService.backendError.next(error.type);
            }
        });
    }

    ngOnInit() {
        this.router.events.subscribe( (evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
        });
    }
}

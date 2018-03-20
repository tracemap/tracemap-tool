import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MainCommunicationService } from './services/main.communication.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'TraceMap';
    searchClasses = {}

    constructor(
        private router: Router,
        private comService: MainCommunicationService,
        private apiService: ApiService
    ){
        this.router.events.subscribe( (val) => {
            if( val['url'].indexOf("homepage") >= 0 ||
                val['url'] == '/') {
                this.comService.searchbarStyle.next(undefined);
                this.searchClasses['mini'] = false;
            } else {
                this.comService.searchbarStyle.next('mini');
                this.searchClasses['mini'] = true;
            }
        });
        this.apiService.getTweetInfo( "975834710495645696").subscribe( (data) => {
            console.log("DATA: " + data);
        }, (error) => {
            if( error.type == 3) {
                console.log("Connection to backend not possible.");
                this.comService.backendError.next(error.type);
            }
        });
    }
}

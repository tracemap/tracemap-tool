import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';

    searchStyle: string;

    constructor(
        private router: Router
    ){
        this.router.events.subscribe( (val) => {
            if( val['url'].indexOf("homepage") >= 0 ||
                val['url'] == '/') {
                this.searchStyle = "";
            } else {
                this.searchStyle = "mini";
            }
        })
    }
}

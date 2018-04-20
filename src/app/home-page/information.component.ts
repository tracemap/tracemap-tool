import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'information',
    templateUrl: 'information.component.html',
    styleUrls: ['home-page.scss',
                'information.component.scss']
})

export class InformationComponent implements OnInit {

    constructor (
        private router: Router
    ) {}
    
    ngOnInit() {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo( 0, 0);
        });
    }
}

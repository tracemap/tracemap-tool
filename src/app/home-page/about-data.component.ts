import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-about-data',
    templateUrl: './about-data.component.html',
    styleUrls: ['./home-page.scss',
                './about-data.component.scss']
})

export class AboutDataComponent implements OnInit {

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

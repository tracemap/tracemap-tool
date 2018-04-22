import { Component, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./home-page.scss',
                './about-us.component.scss']
})

export class AboutUsComponent implements AfterViewInit{

    constructor(
        private router: Router
    ){}

    ngAfterViewInit() {
        window.scrollTo(0,0);
    }

}

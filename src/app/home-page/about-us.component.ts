import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./home-page.scss',
                './about-us.component.scss']
})

export class AboutUsComponent implements OnInit{

    constructor(
        private router: Router
    ){}

    ngOnInit() {
    }

}

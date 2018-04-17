import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./home-page.scss',
                './about-us.component.scss']
})

export class AboutUsComponent implements OnInit{

    ngOnInit() {
        window.scrollTo(0, 0);
    }

}

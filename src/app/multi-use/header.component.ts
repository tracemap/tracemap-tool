import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

    constructor(
        private router: Router
    ){}

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

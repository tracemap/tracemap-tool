import { Component, Input } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

    disableRipples=false;

    navLinks = [
        {
            label1:"THE ",
            label2:"TOOL",
            path:"/homepage"
        },{
            label1:"ABOUT ",
            label2:"US",
            path:"/about"
        },{
            label1:"HOW IT ",
            label2:"WORKS",
            path:"/howitworks"
        },{
            label1:"CODE OF ",
            label2:"CONDUCT",
            path:"/codeofconduct"
        }
    ];
    constructor(
        private router: Router,
    ){}

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

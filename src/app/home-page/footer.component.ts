import { Component } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'my-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})

export class FooterComponent{
    navItems1 = [
        {
            label: "Home",
            path: "/home"
        },
        {
            label: "About Us",
            path: "/about"
        },
        {
            label: "Information",
            path: "/information"
        }
    ];

    navItems2 = [
        // {
        //     label: "Code of Conduct",
        //     path: "/codeofconduct"
        // },
        {
            label: "Imprint",
            path: "/imprint"
        }
    ];

    constructor(
        private router: Router
    ){}

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

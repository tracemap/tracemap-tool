import { Component } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})

export class MenuComponent {

    color = "purple";
    open = false;

    navItems = [
        {
            label: "TraceMap",
            path: "/"
        },
        {
            label: "About Us",
            path: "/about"
        },
        {
            label: "Information",
            path: "/information"
        },
        {
            label: "Code of Conduct",
            path: "/codeofconduct"
        }
    ];

    constructor(
        private router: Router,
    ){}

    closeMenu(): void {
        this.open = false;
    }

    openMenu(): void {
        this.open = true;
    }

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

import { Component, Input } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})

export class MenuComponent{

    @Input('color')
    color: string;

    open = false;

    navItems = [
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
        },
        {
            label: "Help Us",
            path: "/helpus"
        },
        {
            label: "Imprint",
            path: "/imprint"
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

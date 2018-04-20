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
            label: "TraceMap",
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
        // {
        //     label: "Code of Conduct",
        //     path: "/codeofconduct"
        // }
    ];

    constructor(
        private router: Router,
    ){}

    closeMenu(): void {
        this.open = false;
    }

    openMenu(): void {
        this.open = true;
        console.log(this.color);
    }

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

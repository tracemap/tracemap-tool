import { Component, Input } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { GuardService } from '../services/guard.service';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})

export class MenuComponent {

    @Input('color')
    color: string;

    open = false;
    loggedIn = false;

    navItems = [
        {
            label: 'Home',
            path: '/home'
        },
        {
            label: 'About Us',
            path: '/about-us'
        },
        {
            label: 'About Data',
            path: '/about-data'
        },
        {
            label: 'Learn More',
            path: '/learn-more'
        },
        {
            label: 'Donate a Token',
            path: '/donate-token'
        }
    ];

    constructor(
        private router: Router,
        private guardService: GuardService
    ) {
        this.guardService.loggedIn.subscribe( loggedIn => {
            this.loggedIn = loggedIn;
        });
    }

    closeMenu(): void {
        this.open = false;
    }

    openMenu(): void {
        this.open = true;
    }

    navigate(location: string): void {
        this.router.navigate([location]);
    }
}

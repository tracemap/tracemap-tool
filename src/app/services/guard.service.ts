import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()

export class GuardService implements CanActivate {
    loggedIn = false;

    constructor(
        private router: Router
    ) {}

    canActivate(): boolean {
        if (!this.loggedIn) {
            alert('You are not allowed to view this page. You are redirected to the Home Page.');
            this.router.navigate(['home']);
            return this.loggedIn;
        } else {
            return true;
        }
    }
}

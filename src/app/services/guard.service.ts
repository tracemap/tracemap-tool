import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable()

export class GuardService implements CanActivate {
    loggedIn = new BehaviorSubject<boolean>(false);
    private sessionToken: string;

    constructor(
        private apiService: ApiService,
        private userService: UserService,
        private router: Router
    ) {}

    login() {
        this.loggedIn.next(true);
    }

    logout() {
        this.loggedIn.next(false);
        this.redirect();
        localStorage.removeItem('session_token');
        localStorage.removeItem('session_email');
    }

    getLastSession(): Promise<boolean> {
        return new Promise( res => {
            const sessionToken = localStorage.getItem('session_token');
            const email = localStorage.getItem('session_email');
            if (email && sessionToken) {
                this.apiService.authCheckSession(email, sessionToken).subscribe( response => {
                    if (response) {
                        this.sessionToken = sessionToken;
                        this.userService.credentials.next({
                            'email': email,
                            'session_token': sessionToken
                        });
                        this.loggedIn.next(true);
                        res(true);
                    } else if (response['error']) {
                        res(false);
                    }
                });
            } else {
                res(false);
            }
        });
    }

    redirect(): void {
        this.router.navigate(['/home']);
    }

    canActivate(): Promise<boolean> {
        return new Promise( res => {
            this.getLastSession().then( response => {
                if (response === false) {
                    alert('You are not allowed to view this page. You are redirected to the Home Page.');
                    this.router.navigate(['/home']);
                }
                res(response);
            });
        });
    }
}

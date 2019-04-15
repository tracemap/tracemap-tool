import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiService } from './api.service';

@Injectable()

export class AuthService implements CanActivate {
    loggedIn = new BehaviorSubject<boolean>(false);
    screen_name = new BehaviorSubject<string>(undefined);

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}

    login() {
        this.loggedIn.next(true);
    }

    logout() {
        localStorage.removeItem('session_token');
        localStorage.removeItem('session_user_id');
        this.loggedIn.next(false);
        this.redirect();
    }

    setSessionToken(sessionToken: string, sessionUserId): void {
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('session_user_id', sessionUserId);
    }

    restoreSession(): Promise<object> {
            const sessionToken = localStorage.getItem('session_token');
            const sessionUserId = localStorage.getItem('session_user_id');
            if (sessionToken && sessionUserId) {
                return this.apiService.checkTwitterOauthSession(sessionToken, sessionUserId).toPromise().then( (response) => {
                    if (response['success']) {
                        this.loggedIn.next(true);
                        this.screen_name.next(response['screen_name']);
                        this.apiService.sessionToken = sessionToken;
                        this.apiService.userId = sessionUserId;
                        return new Promise((res) => res(response));
                    }
                });
            } else {
                return new Promise((res) => res({'success': false, 'status': 'no sessionToken or sessionUserId in local storage.'}));
            }
    }

    redirect(): void {
        this.router.navigate(['/home']);
    }

    canActivate(): Promise<boolean> {
        return new Promise( res => {
            this.restoreSession().then( response => {
                if (response['success']) {
                    res(true);
                } else {
                    alert('You are not allowed to view this page. You are redirected to the Home Page.');
                    this.router.navigate(['/home']);
                    res(false);
                }
            });
        });
    }
}

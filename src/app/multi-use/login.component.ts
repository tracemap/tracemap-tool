import { Component, Input } from '@angular/core';

import { ApiService } from './../services/api.service';
import { GuardService } from './../services/guard.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
    @Input('color')
    color: string;
    menuOpen = false;
    registerOpen = false;
    forgotOpen = false;
    error: string;
    loggedIn: boolean;
    // user data
    email: string;
    sessionToken: string;

    constructor(
        private apiService: ApiService,
        private guardService: GuardService,
        private userService: UserService
    ) {
        this.guardService.getLastSession();
        this.guardService.loggedIn.subscribe(loggedIn => {
            this.loggedIn = loggedIn;
        });
    }

    openMenu(): void {
        this.error = '';
        if (this.menuOpen) {
            this.menuOpen = false;
            this.registerOpen = false;
            this.forgotOpen = false;
        } else {
            this.menuOpen = true;
        }
    }

    toggleRegister(): void {
        this.error = '';
        this.registerOpen ? this.registerOpen = false : this.registerOpen = true;
        this.forgotOpen = false;
    }

    toggleForgot(): void {
        this.error = '';
        this.forgotOpen ? this.forgotOpen = false : this.forgotOpen = true;
    }

    login(email: string, password: string): void {
        if (email && password) {
            this.apiService.authCheckPassword(email, password).subscribe( response => {
                const passwordCheck = response['password_check'];
                if (passwordCheck) {
                    const sessionToken = response['session_token'];
                    localStorage.setItem('session_token', sessionToken);
                    localStorage.setItem('session_email', email);
                    this.userService.credentials.next({
                        'email': email,
                        'session_token': sessionToken
                    });
                    this.guardService.loggedIn.next(true);
                    this.menuOpen = false;
                } else {
                    this.error = response['error'];
                }
            });
        } else {
            this.error = 'Please enter a valid email and password.';
        }
    }

    register(username: string, email: string): void {
        if (username && email) {
            this.apiService.authAddUser(username, email).subscribe( response => {
                if (response['error']) {
                    this.error = response['error'];
                } else {
                    this.error = 'We sent a password to your mail account.';
                    this.registerOpen = false;
                }
            });
        } else {
            this.error = 'Please enter a username and a valid email.';
        }
    }

    sendResetMail(email: string) {
        if (email) {
            this.apiService.authRequestReset(email).subscribe( response => {
                if (response['error']) {
                    this.error = response['error'];
                } else {
                    this.error = 'The e-mail was successfully sent.';
                }
            });
        } else {
            this.error = 'Please enter a valid email.';
        }
    }
}

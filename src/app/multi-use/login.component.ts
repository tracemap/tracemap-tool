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
    register = false;
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
        this.menuOpen ? this.menuOpen = false : this.menuOpen = true;
    }

    toggleRegister(): void {
        this.register ? this.register = false : this.register = true;
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
}

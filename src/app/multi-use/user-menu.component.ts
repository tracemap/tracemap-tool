import { Component, Input } from '@angular/core';
import { GuardService } from '../services/guard.service';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { timeInterval } from 'rxjs/operators';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./../tool/multi-use/tooltip.scss', './user-menu.component.scss']
})

export class UserMenuComponent {
    @Input('color')
    color: string;

    menuOpen = false;
    username = '';
    email = '';
    formOpen = '';
    errorMsg = '';

    constructor(
        private guardService: GuardService,
        private apiService: ApiService,
        private userService: UserService
    ) {
        this.userService.credentials.subscribe( credentials => {
            if (credentials) {
                const email = credentials['email'];
                const sessionToken = credentials['session_token'];
                this.apiService.authGetUserData(email, sessionToken).subscribe( response => {
                    this.username = response['u.username'];
                    this.email = response['u.email'];
                });
            }
        });
    }

    togglePasswordChange(): void {
        this.formOpen === 'passwordChange' ? this.formOpen = '' : this.formOpen = 'passwordChange';
    }

    toggleDelete(): void {
        this.formOpen === 'deleteAccount' ? this.formOpen = '' : this.formOpen = 'deleteAccount';
    }

    toggleMenu(): void {
        this.formOpen = '';
        this.errorMsg = '';
        this.menuOpen ? this.menuOpen = false : this.menuOpen = true;
    }

    logout(): void {
        this.guardService.logout();
    }

    changePassword( oldPass: string, newPass1: string, newPass2: string): void {
        if (oldPass && newPass1 && newPass2) {
            if (newPass1 === newPass2) {
                this.apiService.authChangePassword(this.email, oldPass, newPass1).subscribe( response => {
                    if (response['error']) {
                        this.errorMsg = response['error'];
                    } else {
                        this.errorMsg = 'your password has been changed.';
                        this.formOpen = '';
                        window.setTimeout( () => {
                            this.guardService.logout();
                        }, 2000);
                    }
                });

            } else {
                this.errorMsg = 'the new passwords do not match.';
            }

        } else {
            this.errorMsg = 'please fill out all input fields.';
        }
    }

    deleteAccount( password: string) {
        if (password) {
            this.apiService.authDeleteUser(this.email, password).subscribe( response => {
                if (response['error']) {
                    this.errorMsg = response['error'];
                } else {
                    this.errorMsg = 'Your account has been deleted';
                    window.setTimeout(() => {
                        this.guardService.logout();
                    }, 2000);
                }
            });
        } else {
            this.errorMsg = 'Please enter your password.';
        }
    }

}

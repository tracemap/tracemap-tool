import { Component, Input } from '@angular/core';
import { GuardService } from '../services/guard.service';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

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
                });
            }
        });
    }

    toggleMenu(): void {
        this.menuOpen ? this.menuOpen = false : this.menuOpen = true;
    }

    logout(): void {
        this.guardService.logout();
    }

}

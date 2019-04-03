import { Component, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./../tool/multi-use/tooltip.scss', './user-menu.component.scss']
})

export class UserMenuComponent {
    @Input('color')
    color: string;

    menuOpen = false;
    screen_name = '';
    formOpen = '';
    errorMsg = '';

    constructor(
        private authService: AuthService,
        private apiService: ApiService,
    ) {
        this.authService.screen_name.subscribe( value => {
            this.screen_name = value;
        });
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
        this.authService.logout();
    }
}

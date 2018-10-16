import { Component, Input } from '@angular/core';

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

    openMenu(): void {
        this.menuOpen ? this.menuOpen = false : this.menuOpen = true;
    }

    toggleRegister(): void {
        this.register ? this.register = false : this.register = true;
    }
}

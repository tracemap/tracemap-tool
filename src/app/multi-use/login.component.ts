import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../services/api.service';
import { AuthService } from './../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
    @Input('color')
    color: string;

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {
        this.route.queryParams.subscribe( params => {
            if (params['oauth_token']) {
                this.apiService.completeTwitterOauth( params['oauth_token'], params['oauth_verifier'])
                .subscribe( response => {
                    if (response['success']) {
                        this.authService.setSessionToken(response['session_token'], response['user_id']);
                        this.authService.redirect();
                    } else {
                        console.log('authentication failed');
                    }
                });
            } else {
                this.authService.restoreSession();
            }
        });
    }

    getTwitterLink() {
        this.apiService.getTwitterOauthLink().subscribe( response => {
            if (response['success']) {
                window.location.href = response['redirect_url'];
            } else {
                console.log(response['status']);
            }
        });
    }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './../services/api.service';
import { GuardService } from './../services/guard.service';

@Component({
	selector: 'home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.scss',
                './home-page.component.scss']
})

export class HomePageComponent {

    errorMsg: string[];

    placeholder = 'Your Url';
    disabled = false;
    loggedIn = false;
    subscriptionResponse = undefined;
    subscriptions = {
        beta_queue: true,
        newsletter: true,
    };
    emailResponse = '';
    emailError = false;

    constructor(
        private apiService: ApiService,
        private guardService: GuardService,
        private router: Router
    ) {
        this.guardService.loggedIn.subscribe( value => {
            this.loggedIn = value;
        });
    }

    scrollToID(id_name: string) {
        const id = '#' + id_name;
        const target = document.querySelector(id);
        window.scrollTo( 0, target['offsetTop']);
    }

    processUrl( searchField): void {
    const input = String(searchField.value);
    searchField.value = '';
    this.getNewRoute(input)
        .then(
            response => {
                document.getElementById('search').blur();
                this.navigate(response);
            },
        reject => this.placeholder = reject);
    }

    getNewRoute(url: string): Promise<string> {
        let dirtyId;
        let id;

        if ( url.indexOf('twitter.com/') >= 0) {
            if ( url.indexOf('/status/') >= 0) {
                dirtyId = url.slice( url.indexOf('/status/') + 8);
                if ( dirtyId.indexOf('/') >= 0) {
                    id = dirtyId.slice(0, dirtyId.indexOf('/'));
                } else {
                    id = dirtyId;
                }
                return Promise.resolve('tool/' + id);
            }
            return Promise.reject('invalid twitter Url');
        }
        return Promise.reject('Please enter a valid Url');
    }

    removePlaceholder(): void {
        this.placeholder = '';
    }

    setPlaceholder(): void {
        this.placeholder = 'Your Url';
    }

    addToNewsletter( emailAdress): void {
        this.subscriptionResponse = undefined;
        if (this.subscriptions.beta_queue || this.subscriptions.newsletter) {
            if ( emailAdress &&
                    emailAdress !== '' &&
                    this.isValidEmail(emailAdress)) {
                    this.emailError = false;
                this.apiService.addToNewsletter(emailAdress).subscribe( response => {
                    this.subscriptionResponse = true;
                    if (response['error']) {
                        this.emailResponse = 'Thanks for insisting.<br>You have already subscribed.';
                    } else {
                        this.emailResponse = 'Thanks for your interest.<br>Please check your inbox and confirm your email address.';
                    }
                });
            } else {
                this.emailError = true;
                this.emailResponse = 'Please enter a valid email.';
            }
        } else {
            this.emailError = true;
            this.emailResponse = 'Please select at least one of the checkboxes.';
        }
    }

    isValidEmail(email) {
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    }

    navigate(location: string): void {
        this.router.navigate([location]);
    }
}

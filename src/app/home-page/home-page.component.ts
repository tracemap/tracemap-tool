import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../services/api.service';

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
    subscriptionResponse = undefined;
    wrongEmail = false;

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}

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
        if ( emailAdress &&
                emailAdress !== '' &&
                this.isValidEmail(emailAdress)) {
            this.wrongEmail = false;
            this.apiService.addToNewsletter(emailAdress).subscribe( answer => {
                console.log(answer);
                this.subscriptionResponse = answer;
            });
        } else {
            console.log('invalid');
            this.wrongEmail = true;
        }
    }

    isValidEmail(email) {
        console.log(email);
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    }

    navigate(location: string): void {
        this.router.navigate([location]);
    }
}

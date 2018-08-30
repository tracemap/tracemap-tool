import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'searchbar',
    templateUrl: './searchbar.component.html',
    styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
    placeholder = "New Tweet Url";

    constructor(
        private router: Router
    ){}

    processUrl( searchField): void {
    let input = String(searchField.value);
    searchField.value = "";
    this.getNewRoute(input)
        .then( 
            response => {
                document.getElementById("search").blur();
                this.navigate(response);
            },
        reject => this.placeholder = reject);
    }

    getNewRoute(url: string): Promise<string> {
        let dirtyId;
        let id;

        if( url.indexOf("twitter.com/") >= 0) {
            if( url.indexOf("/status/") >= 0) {
                dirtyId = url.slice( url.indexOf("/status/") + 8);
                if( dirtyId.indexOf("/") >= 0) {
                    id = dirtyId.slice(0, dirtyId.indexOf("/"));
                } else {
                    id = dirtyId;
                }
                return Promise.resolve("tool/" + id);
            }
            return Promise.reject("Invalid twitter Url");
        }
        return Promise.reject("Please enter a valid Url");
    }

    removePlaceholder(): void {
        this.placeholder = "";
    }

    setPlaceholder(): void {
        this.placeholder = "New Tweet Url";
    }

    navigate(location:string):void {
        this.router.navigate([location]);
    }
}

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  @Input()
  style: string;

  placeholder = "Enter a Tweet URL";

  constructor(
    private router: Router
  ) {}

  processUrl( searchField): void {
    let input = String(searchField.value);
    searchField.value = "";
    this.getNewRoute(input)
      .then( 
        response => {
          this.placeholder = "";
          this.router.navigate([response]);
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
        return Promise.resolve("twitter/" + id);
      }
      return Promise.reject("invalid twitter Url");
    }
    if( url.indexOf("vk.com/") >= 0) {
      if( url.indexOf("wall") >= 0) {
        id = url.slice( url.indexOf("wall") + 4)
                      .replace("_","/");
        return Promise.resolve("vk/" + id);
      }
      return Promise.reject("invalid vk Url");
    }
    return Promise.reject("Please enter a valid Url");
  }

  removePlaceholder(): void {
    this.placeholder = "";
  }

  setPlaceholder(): void {
    this.placeholder = "Enter a Tweet URL";
  }
}
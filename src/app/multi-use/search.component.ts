import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MainCommunicationService } from './../services/main.communication.service';

@Component({
	selector: 'search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  classes = {};

  placeholder = "Enter a Tweet URL";
  disabled = false;

  constructor(
    private router: Router,
    private comService: MainCommunicationService
  ) {
    this.comService.backendError.subscribe( error => {
      if( error) {
        this.disabled = true;
        this.classes["disabled"] = true;
      } else {
        this.classes["disabled"] = false;
      }
    });
    this.comService.searchbarStyle.subscribe( style => {
      if( style == 'mini') {
        this.classes["mini"] = true;
      } else {
        this.classes["mini"] = false;
      }
    })
  }

  processUrl( searchField): void {
    let input = String(searchField.value);
    searchField.value = "";
    this.getNewRoute(input)
      .then( 
        response => {
          document.getElementById("search").blur();
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
    return Promise.reject("Please enter a valid Url");
  }

  removePlaceholder(): void {
    this.placeholder = "";
  }

  setPlaceholder(): void {
    this.placeholder = "Enter a Tweet URL";
  }
}

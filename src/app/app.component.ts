import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'TraceMap';
    searchClasses = {}

    constructor(
        private router: Router,
        private apiService: ApiService
    ){}

    ngOnInit() {
        this.router.events.subscribe( (evt) => {
            window.scrollTo(0, 0);
        });
    }
}

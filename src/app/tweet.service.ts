import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { environment } from './../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable( )

export class TweetService {

    url = environment.apiUrl;

    constructor( 
        private http: Http,

    ) { }

    getHtml( tweetId: string): Promise<String> {
        return this.http
                   .get(this.url + "/tweet/get_html/" + tweetId)
                   .toPromise()
                   .then( response => response.json())
    }
}
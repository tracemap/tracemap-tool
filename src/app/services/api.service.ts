import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthService } from '../services/auth.service';

import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

@Injectable( )

export class ApiService {
    url = environment.apiUrl;
    userId: string;
    sessionToken: string;

    tracemapData = new BehaviorSubject<object>(undefined);
    graphData = new BehaviorSubject<object>(undefined);

    jsonHeader = new Headers({
        'Content-Type': 'application/json'
    });

    constructor(
        private http: Http,
    ) {}

    getTwitterOauthLink(): Observable < object > {
        console.log('#apiService#: getTwitterOauthLink');
        const url = this.url + '/twitter/start_authenticate';
        return this.http.get(url).map( response => response.json() );
    }

    completeTwitterOauth( oauth_token: string, oauth_verifier: string): Observable < object > {
        console.log('#apiService#: completeTwitterOauth');
        const url = this.url + '/twitter/complete_authenticate';
        const body = JSON.stringify({
            oauth_token: oauth_token,
            oauth_verifier: oauth_verifier
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => {
                return response.json();
            });
    }

    checkTwitterOauthSession( sessionToken: string, sessionUserId: string): Observable < object > {
        console.log('#apiService#: checkTwitterOauthSession');
        const url = this.url + '/twitter/check_session';
        const body = JSON.stringify({
            auth_session_token: sessionToken,
            auth_user_id: sessionUserId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => {
                return response.json();
            });
    }

    // Tool Methods
    getTweetInfo( tweetId: string): Observable < object > {
        console.log('#apiService#: getTweetInfo');
        const url = this.url + '/twitter/get_tweet_info';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            tweet_id: tweetId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getTweetData( tweetId: string): Observable < object > {
        console.log('#apiService#: getTweetData');
        const url = this.url + '/twitter/get_tweet_data';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            tweet_id: tweetId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getTimeline( userId: string): Observable < object > {
        console.log('#apiService#: getTimeline');
        const url = this.url + '/twitter/get_user_timeline';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            user_id: userId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }

    getUserInfo( userId: string): Observable < object > {
        console.log('#apiService#: getUserInfo');
        const url = this.url + '/twitter/get_user_info';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            user_id: userId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }

    getTweetFollowships(tweetId: string): Observable < object > {
        console.log('#apiService#: getTweetFollowships');
        const url = this.url + '/neo4j/get_tweet_followships';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            tweet_id: tweetId
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }

    labelUnknownUsers( retweeterIds: string[]): Observable < string[] > {
        console.log('#apiService#: labelUnknownUsers');
        const url = this.url + '/neo4j/label_unknown_users';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            user_ids: retweeterIds
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }

    // Nontool Methods

    newsletterStartSubscription( email: string, subscriptions: object): Observable < string > {
        console.log('#apiService#: addToNewsletter()');
        const url = this.url + '/newsletter/start_subscription';
        const body = JSON.stringify({
            email: email.toLowerCase(),
            beta_subscribed: subscriptions['beta_queue'],
            newsletter_subscribed: subscriptions['newsletter']
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }

    loggingWriteLog( fileName: string, logObject: object): Observable < object > {
        console.log('#apiService#: loggingWriteLog()');
        const url = this.url + '/logging/write_log';
        const body = JSON.stringify({
            auth_user_id: this.userId,
            auth_session_token: this.sessionToken,
            file_name: fileName,
            log_object: logObject
        });
        return this.http
            .post( url, body, {headers: this.jsonHeader})
            .map( response => response.json());
    }
}

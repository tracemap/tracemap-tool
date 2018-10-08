import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

@Injectable( )

export class ApiService {
    url = environment.apiUrl;


    tracemapData = new BehaviorSubject<object>(undefined);
    graphData = new BehaviorSubject<object>(undefined);

    constructor(
        private http: Http
        ) {
    }

    getTweetInfo( tweetId: string): Observable<object> {
        console.log('#apiService#: getTweetInfo');
        return this.http
            .get( this.url + '/twitter/get_tweet_info/' + tweetId)
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getTweetData( tweetId: string): Observable<object> {
        console.log('#apiService#: getTweetData');
        return this.http
            .get( this.url + '/twitter/get_tweet_data/' + tweetId)
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getTimeline( userId: string): Observable<object> {
        console.log('#apiService#: getTimeline');
        return this.http
            .get( this.url + '/twitter/get_user_timeline/' + userId)
            .map( response => {
                return response.json();
            });
    }

    getUserInfo( userId: string): Observable<object> {
        console.log('#apiService#: getUserInfo');
        return this.http
            .get( this.url + '/twitter/get_user_info/' + userId)
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getRetweeters( tweetId: string): Observable<string[]> {
        console.log('#apiService#: getRetweeters');
        return this.http
            .get(this.url + '/twitter/get_retweeters/' + tweetId)
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getFollowers( retweeterIds: string[], authorId: string): Observable<object> {
        console.log('#apiService#: getFollowers');
        const retweetersString = authorId + ',' + retweeterIds.toString();
        return this.http
            .get(this.url + '/neo4j/get_followers/' + retweetersString)
            .map( response => {
                const data = response.json();
                return data['response'];
            });
    }

    getTracemapData(tweetId: string): Promise<object> {
        console.log('#apiService#: getTracemapData');
        const tracemapData = {};
        return new Promise( (resolve, reject) => {
            this.getTweetData( tweetId)
                .flatMap( tweetData => {
                    tracemapData['tweet_data'] = tweetData;
                    const userIds = tracemapData['tweet_data']['retweeter_ids'];
                    const authorId = tracemapData['tweet_data']['tweet_info']['user']['id_str'];
                    return this.getFollowers( userIds, authorId);
                }).subscribe( followersList => {
                    tracemapData['followers'] = followersList;
                    this.tracemapData.next(tracemapData);
                    resolve( tracemapData);
            });
        });
    }

    labelUnknownUsers( retweeterIds: string[], authorId: string): Observable<string> {
        console.log('#apiService#: labelUnknownUsers');
        const retweetersString = authorId + ',' + retweeterIds.toString();
        console.log(retweetersString);
        return this.http
            .get(this.url + '/neo4j/label_unknown_users/' + retweetersString)
            .map( response => {
                return response.json();
            });
    }

    addToNewsletter( emailAdress: string): Observable<string> {
        console.log('#apiService#: addToNewsletter()');
        return this.http
            .get( this.url + '/newsletter/save_subscriber/' + emailAdress)
            .map( response => {
                return response.text();
            });
    }

    authAddUser( username: string, email: string): Observable<object> {
        console.log('#apiService#: authAddUser');
        return this.http
            .get( this.url + '/auth/add_user/' + username + '/' + email)
            .map( response => response.json());
    }

    authCheckPassword( email: string, password: string): Observable<string> {
        console.log('#apiService#: authCheckPassword()');
        return this.http
            .get( this.url + '/auth/check_password/' + email + '/' + password)
            .map( response => response.json() );
    }

    authCheckSession( email: string, sessionToken: string): Observable<string> {
        console.log('#apiService#: authCheckSession()');
        return this.http
            .get( this.url + '/auth/check_session/' + email + '/' + sessionToken)
            .map( response => response.json() );
    }

    authGetUserData( email: string, sessionToken: string): Observable<object> {
        console.log('#apiService#: authGetUserData()');
        return this.http
            .get( this.url + '/auth/get_user_data/' + email + '/' + sessionToken)
            .map( response => response.json());
    }
}

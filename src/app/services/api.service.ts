import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { environment } from './../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

@Injectable( )

export class ApiService {
    url = environment.apiUrl;

    
    tracemapData = new BehaviorSubject<object>(undefined);
    graphData = new BehaviorSubject<object>(undefined);

    constructor( 
        private http:Http
        ) {
    }

    getTweetInfo( tweetId: string): Observable<object> {
        return this.http
                   .get( this.url + "/twitter/get_tweet_info/" + tweetId)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getTweetData( tweetId: string): Observable<object> {
      return this.http
                 .get( this.url + "/twitter/get_tweet_data/" + tweetId)
                 .map( response => {
                     let data = response.json();
                     return data['response'];
                 });
    }

    getTimeline( userId: string): Observable<object> {
      return this.http
                 .get( this.url + "/twitter/get_user_timeline/" + userId)
                 .map( response => {
                     return response.json();
                 });
    }

    getUserInfo( userId: string): Observable<object> {
        return this.http
                   .get( this.url + "/twitter/get_user_info/" + userId)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getRetweeters( tweetId: string): Observable<string[]> {
        return this.http
                   .get(this.url + "/twitter/get_retweeters/" + tweetId)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getFollowers( retweeterIds: string[], authorId: string): Observable<object> {
        let retweetersString = authorId + "," + retweeterIds.toString();
        return this.http
                   .get(this.url + "/neo4j/get_followers/" + retweetersString)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getTracemapData(tweetId: string): Promise<object> {
        let tracemapData = {};
        return new Promise( (resolve, reject) => {
            this.getTweetData( tweetId)
                .flatMap( tweetData => {
                    tracemapData['tweet_data'] = tweetData;
                    let userIds = tracemapData['tweet_data']['retweeter_ids'];
                    let authorId = tracemapData['tweet_data']['tweet_info']['user']['id_str'];
                    return this.getFollowers( userIds, authorId)
                }).subscribe( followersList => {
                    tracemapData['followers'] = followersList;
                    this.tracemapData.next(tracemapData);
                    resolve( tracemapData);
            })
        });
    }
}

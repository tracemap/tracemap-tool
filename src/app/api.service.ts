import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from './../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

@Injectable( )

export class ApiService {
    url = environment.apiUrl;

    tracemapData;

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

    getUserInfo( userId: string): Observable<object> {
        return this.http
                   .get( this.url + "/twitter/get_user_info/" + userId)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getRetweeters( tweetId: string): Observable<string[]> {
        console.log(this.url);
        return this.http
                   .get(this.url + "/twitter/get_retweeters/" + tweetId)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getFollowers( retweeterIds: string[]): Observable<object> {
        let retweetwersString = retweeterIds.toString();
        return this.http
                   .get(this.url + "/neo4j/get_followers/" + retweetwersString)
                   .map( response => {
                       let data = response.json();
                       return data['response'];
                   });
    }

    getTracemapData(tweetId: string): Promise<object> {
        let tracemapData = {};
        return new Promise( (resolve, reject) => {
            if( this.tracemapData)//TODO catch stuff correctly
                console.log("is here");
            this.getRetweeters( tweetId)
                .flatMap( retweeters => {
                    tracemapData['retweeters'] = retweeters;
                    return this.getTweetInfo(tweetId);
                }).flatMap( tweetInfo => {
                    tracemapData['tweet_info'] = tweetInfo;
                    let authorId = tracemapData['tweet_info'][tweetId]['author'];
                    let userIds = tracemapData['retweeters'].concat( [authorId]);
                    return this.getFollowers( userIds)
                }).subscribe( followersList => {
                    tracemapData['followers'] = followersList;
                    console.log("Tracemap data:");
                    console.log(tracemapData['tweet_info'][tweetId]);
                    resolve( tracemapData);
            })
             
        });
    }
}
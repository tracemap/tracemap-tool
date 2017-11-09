import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import * as Twitter from 'twit';

import { twitterAuth } from '../../environments/environment';

import 'rxjs/add/operator/toPromise';

@Injectable()

export class TwitterApiService {

  client = new Twitter({
    consumer_key: twitterAuth.consumer_key,
    consumer_secret: twitterAuth.consumer_secret,
    access_token: twitterAuth.access_token_key,
    access_token_secret: twitterAuth.access_token_secret
  });

  getFollowers(): void {
    this.client.get('search/tweet', {q: 'banana', count: 100} ,function( err, data, response){
      console.log(data);
      console.log(response);
    });
  }
}
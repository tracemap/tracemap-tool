import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TwitterApiService } from './twitter/twitter-api.service';

import * as Twitter from 'twit';

import { twitterAuth } from '../environments/environment';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [ TwitterApiService]
})

export class MainComponent implements OnInit {

  private client = new Twitter({
    consumer_key: twitterAuth.consumer_key,
    consumer_secret: twitterAuth.consumer_secret,
    access_token: twitterAuth.access_token_key,
    access_token_secret: twitterAuth.access_token_secret
  });

  constructor(
    private route: ActivatedRoute,
    private twitterApiService: TwitterApiService,
  ) {}

  ngOnInit(): void {
    this.client.get('search/tweets', {q: 'banana', count: 100}, function( err, data, response){
      console.log(data);
    });
  }
}
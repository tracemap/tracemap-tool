import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TwitterApiService } from './twitter/twitter-api.service';


@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [ TwitterApiService]
})

export class MainComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private twitterApiService: TwitterApiService,
  ) {}

  ngOnInit(): void {
    this.twitterApiService.getFollowers(); 
  }
}
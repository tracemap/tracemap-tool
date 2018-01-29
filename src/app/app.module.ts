import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { UserComponent } from './user.component';
import { UserTimelineComponent } from './user.timeline.component';
import { InfoComponent } from './info.component';
import { D3Component } from './d3.component';
import { SearchComponent } from './search.component';
import { TweetComponent } from './tweet.component';
import { PageNotFoundComponent } from './page-not-found.component';

import { HomePageComponent } from './home-page/home-page.component';
import { DescriptionVkComponent } from './home-page/description-vk.component';
import { DescriptionTwitterComponent } from './home-page/description-twitter.component';

import { ApiService } from './api.service';
import { MainCommunicationService } from './main.communication.service';
import { TweetService } from './tweet.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    UserComponent,
    UserTimelineComponent,
    InfoComponent,
    D3Component,
    SearchComponent,
    TweetComponent,
    PageNotFoundComponent,
    HomePageComponent,
      DescriptionVkComponent,
      DescriptionTwitterComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [ 
    ApiService,
    MainCommunicationService,
    TweetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

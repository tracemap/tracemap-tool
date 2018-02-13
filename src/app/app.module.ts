import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { HeaderComponent } from './header.component';
import { UserComponent } from './user.component';
import { UserTimelineComponent } from './user.timeline.component';
import { InfoComponent } from './info.component';
import { D3Component } from './d3.component';
import { SearchComponent } from './search.component';
import { TweetComponent } from './tweet.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { LoadingComponent } from './loading.component';
import { ShareComponent } from './share.component';

import { HomePageComponent } from './home-page/home-page.component';
import { DescriptionTwitterComponent } from './home-page/description-twitter.component';

import { ApiService } from './api.service';
import { MainCommunicationService } from './main.communication.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    UserComponent,
    UserTimelineComponent,
    InfoComponent,
    D3Component,
    SearchComponent,
    TweetComponent,
    PageNotFoundComponent,
    LoadingComponent,
    ShareComponent,
    HomePageComponent,
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
    MainCommunicationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

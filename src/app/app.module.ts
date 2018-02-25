import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { HeaderComponent } from './header.component';
import { UserComponent } from './side-panel/user.component';
import { UserTimelineComponent } from './side-panel/user.timeline.component';
import { InfoComponent } from './side-panel/info.component';
import { D3Component } from './d3.component';
import { SearchComponent } from './search.component';
import { TweetComponent } from './tweet.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { LoadingComponent } from './loading.component';
import { ShareComponent } from './share.component';
import { HelpComponent } from './help.component';

import { HomePageComponent } from './home-page/home-page.component';
import { DescriptionTwitterComponent } from './home-page/description-twitter.component';

import { ApiService } from './api.service';
import { MainCommunicationService } from './main.communication.service';
import { HighlightService } from './highlight.service';

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
    HelpComponent,
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
    MainCommunicationService,
    HighlightService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

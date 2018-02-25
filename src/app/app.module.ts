import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainComponent } from './tool-main-panel/main.component';
import { HeaderComponent } from './multi-use/header.component';
import { UserComponent } from './tool-side-panel/user.component';
import { UserTimelineComponent } from './tool-side-panel/user.timeline.component';
import { InfoComponent } from './tool-side-panel/info.component';
import { D3Component } from './tool-main-panel/d3.component';
import { SearchComponent } from './multi-use/search.component';
import { TweetComponent } from './multi-use/tweet.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { LoadingComponent } from './multi-use/loading.component';
import { ShareComponent } from './tool-main-panel/share.component';
import { HelpComponent } from './tool-main-panel/help.component';
import { AboutUsComponent } from './home-page/about-us.component';
import { HowItWorksComponent } from './home-page/how-it-works.component';
import { CodeOfConductComponent } from './home-page/code-of-conduct.component';

import { HomePageComponent } from './home-page/home-page.component';

import { ApiService } from './services/api.service';
import { MainCommunicationService } from './services/main.communication.service';
import { HighlightService } from './services/highlight.service';

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
    AboutUsComponent,
    HowItWorksComponent,
    CodeOfConductComponent
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

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { MultiUseModule } from './multi-use/multi-use.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { AboutUsComponent } from './home-page/about-us.component';
import { CodeOfConductComponent } from './home-page/code-of-conduct.component';
import { InformationComponent } from './home-page/information.component';
import { HelpUsComponent } from './home-page/help-us.component';
import { FooterComponent } from './home-page/footer.component';
import { SitemapComponent } from './home-page/sitemap.component';
import { HomePageComponent } from './home-page/home-page.component';

import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HomePageComponent,
    AboutUsComponent,
    CodeOfConductComponent,
    InformationComponent,
    SitemapComponent,
    HelpUsComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    RouterModule,
    MultiUseModule
  ],
  providers: [ 
    ApiService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

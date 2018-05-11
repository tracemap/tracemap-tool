import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MenuComponent } from './multi-use/menu.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { AboutUsComponent } from './home-page/about-us.component';
import { CodeOfConductComponent } from './home-page/code-of-conduct.component';
import { InformationComponent } from './home-page/information.component';
import { HelpUsComponent } from './home-page/help-us.component';
import { FooterComponent } from './home-page/footer.component';
import { SitemapComponent } from './home-page/sitemap.component';
import { HomePageComponent } from './home-page/home-page.component';

import { ApiService } from './services/api.service';
import { MainCommunicationService } from './services/main.communication.service';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
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
    RouterModule
  ],
  providers: [ 
    ApiService,
    MainCommunicationService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

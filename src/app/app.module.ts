import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GestureConfig } from '@angular/material';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { MatCheckboxModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';
import { MultiUseModule } from './multi-use/multi-use.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { AboutUsComponent } from './home-page/about-us.component';
import { AboutDataComponent } from './home-page/about-data.component';
import { LearnMoreComponent } from './home-page/learn-more.component';
import { DonateTokenComponent } from './home-page/donate-token.component';
import { FooterComponent } from './home-page/footer.component';
import { SitemapComponent } from './home-page/sitemap.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PrivacyComponent } from './home-page/privacy.component';

import { ApiService } from './services/api.service';
import { GuardService } from './services/guard.service';
import { UserService } from './services/user.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HomePageComponent,
    AboutUsComponent,
    AboutDataComponent,
    DonateTokenComponent,
    SitemapComponent,
    LearnMoreComponent,
    FooterComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    AppRoutingModule,
    RouterModule,
    MultiUseModule,
    MatCheckboxModule,
    FormsModule
  ],
  providers: [
    ApiService,
    GuardService,
    UserService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

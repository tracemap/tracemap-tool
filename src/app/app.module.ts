import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { SearchComponent } from './search.component';
import { PageNotFoundComponent } from './page-not-found.component';

import { HomePageComponent } from './home-page/home-page.component';
import { DescriptionVkComponent } from './home-page/description-vk.component';
import { DescriptionTwitterComponent } from './home-page/description-twitter.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SearchComponent,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

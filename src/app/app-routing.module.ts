import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent} from './home-page/home-page.component';
import { DescriptionVkComponent} from './home-page/description-vk.component';
import { DescriptionTwitterComponent } from './home-page/description-twitter.component';

import { MainComponent } from './main.component';

import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
	{ path: 'homepage', component: HomePageComponent , children: [
		{path: 'vk', component: DescriptionVkComponent},
		{path: 'twitter', component: DescriptionTwitterComponent}
	]},
	{ path: '', redirectTo: 'homepage', pathMatch: 'full'},
  { path: 'twitter/:pid', component: MainComponent },
  { path: 'vk/:uid/:pid', component: MainComponent },
	{ path: '**', component: PageNotFoundComponent }

];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
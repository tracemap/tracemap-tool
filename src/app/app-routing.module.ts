import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent} from './home-page/home-page.component';

import { AboutUsComponent } from './home-page/about-us.component';
import { LearnMoreComponent } from './home-page/learn-more.component';
import { AboutDataComponent } from './home-page/about-data.component';
import { SitemapComponent } from './home-page/sitemap.component';
import { DonateTokenComponent } from './home-page/donate-token.component';

import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
	{ path: 'home', component: HomePageComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'about-us', component: AboutUsComponent},
    // { path: 'codeofconduct', component: CodeOfConductComponent},
    { path: 'about-data', component: AboutDataComponent},
    { path: 'learn-more', component: LearnMoreComponent},
    { path: 'donate-token', component: DonateTokenComponent},
    { path: 'legal', component: SitemapComponent},
    { path: 'tool', loadChildren: 'app/tool/tool.module#ToolModule'},
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}

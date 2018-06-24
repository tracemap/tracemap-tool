import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent} from './home-page/home-page.component';

import { AboutUsComponent } from './home-page/about-us.component';
import { HelpUsComponent } from './home-page/help-us.component';
import { InformationComponent } from './home-page/information.component';
import { SitemapComponent } from './home-page/sitemap.component';

import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
	{ path: 'home', component: HomePageComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'about', component: AboutUsComponent},
    { path: 'helpus', component: HelpUsComponent},
    // { path: 'codeofconduct', component: CodeOfConductComponent},
    { path: 'information', component: InformationComponent},
    { path: 'imprint', component: SitemapComponent},
    { path: 'tool', loadChildren: 'app/tool/tool.module#ToolModule'},
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}

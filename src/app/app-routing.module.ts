import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent} from './home-page/home-page.component';

import { MainComponent } from './tool-main-panel/main.component';
import { UserComponent } from './tool-side-panel/user.component';
import { InfoComponent } from './tool-side-panel/info.component';
import { AboutUsComponent } from './home-page/about-us.component';
import { HelpUsComponent } from './home-page/help-us.component';
import { CodeOfConductComponent } from './home-page/code-of-conduct.component';
import { InformationComponent } from './home-page/information.component';

import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
	{ path: 'home', component: HomePageComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'about', component: AboutUsComponent},
    { path: 'helpus', component: HelpUsComponent},
    // { path: 'codeofconduct', component: CodeOfConductComponent},
    { path: 'information', component: InformationComponent},
    // { path: 'twitter/:pid', component: MainComponent, children: [
    	// {path: 'details/:uid', component: UserComponent},
        // {path: '**', component: InfoComponent}
    // ]},
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}

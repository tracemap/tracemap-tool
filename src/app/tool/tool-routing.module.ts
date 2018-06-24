import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToolComponent } from './tool.component';
import { UserDetailsComponent } from './side-panel/user/user-details.component';

const routes: Routes = [
    { path: ':tid', component: ToolComponent, children:[
        {path: 'details/:uid', component: UserDetailsComponent}
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ToolRoutingModule { }

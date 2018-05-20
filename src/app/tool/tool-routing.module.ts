import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToolComponent } from './tool.component';

const routes: Routes = [
    { path: ':pid', component: ToolComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ToolRoutingModule { }

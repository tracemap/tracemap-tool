import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material';

import { MenuComponent } from './menu.component';
import { LoginComponent } from './login.component';
import { UserMenuComponent } from './user-menu.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MatProgressSpinnerModule
     ],
    declarations: [
        MenuComponent ,
        LoginComponent,
        UserMenuComponent
    ],
    exports: [ MenuComponent ],
})
export class MultiUseModule {}

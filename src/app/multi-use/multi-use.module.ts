import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu.component';
import { LoginComponent } from './login.component';
import { UserMenuComponent } from './user-menu.component';

@NgModule({
    imports: [ CommonModule, RouterModule ],
    declarations: [
        MenuComponent ,
        LoginComponent,
        UserMenuComponent
    ],
    exports: [ MenuComponent ]
})
export class MultiUseModule {}

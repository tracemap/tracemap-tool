import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu.component';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [ CommonModule, RouterModule ],
    declarations: [
        MenuComponent ,
        LoginComponent
    ],
    exports: [ MenuComponent ]
})
export class MultiUseModule {}

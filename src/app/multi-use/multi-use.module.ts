import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu.component';


@NgModule({
    imports: [ CommonModule, RouterModule ],
    declarations: [ MenuComponent ],
    exports: [ MenuComponent ]
})
export class MultiUseModule {}

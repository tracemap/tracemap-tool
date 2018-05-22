import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiUseModule } from './../multi-use/multi-use.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { ToolRoutingModule } from './tool-routing.module';
import { ToolComponent } from './tool.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
    import { GraphComponent } from './main-panel/graph.component';
    import { SettingsComponent } from './main-panel/settings.component';
    import { TourComponent } from './main-panel/tour.component';
    import { ZoomComponent } from './main-panel/zoom.component';
    import { TimesliderComponent } from './main-panel/timeslider.component';
import { SidePanelComponent } from './side-panel/side-panel.component';

@NgModule({
  imports: [
      CommonModule,
      ToolRoutingModule,
      MultiUseModule,
      MatSlideToggleModule,
      MatCheckboxModule,
      FormsModule
  ],
  declarations: [
      ToolComponent,
      MainPanelComponent,
          GraphComponent,
          SettingsComponent,
          TourComponent,
          ZoomComponent,
          TimesliderComponent,
      SidePanelComponent
  ]
})
export class ToolModule { }

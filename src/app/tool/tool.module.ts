import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiUseModule } from './../multi-use/multi-use.module';
import { MatSliderModule } from '@angular/material/slider';
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
      MatSliderModule
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

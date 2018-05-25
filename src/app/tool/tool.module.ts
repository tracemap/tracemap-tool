import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolRoutingModule } from './tool-routing.module';
import { MultiUseModule } from './../multi-use/multi-use.module';

import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { GestureConfig } from '@angular/material';

import { ToolComponent } from './tool.component';
import { HintComponent } from './multi-use/hint.component';
import { TweetComponent } from './multi-use/tweet.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
    import { GraphComponent } from './main-panel/graph.component';
    import { SettingsComponent } from './main-panel/settings.component';
    import { TourComponent } from './main-panel/tour.component';
    import { ZoomComponent } from './main-panel/zoom.component';
    import { TimesliderComponent } from './main-panel/timeslider.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
    import { SearchbarComponent } from './side-panel/searchbar.component';
    import { ShareComponent } from './side-panel/share.component';
    import { AccordeonsComponent } from './side-panel/accordeons/accordeons.component';
        import { AccSourceComponent } from './side-panel/accordeons/acc-source.component';
import { CommunicationService } from './services/communication.service';
import { GraphService } from './services/graph.service';
import { LocalStorageService } from './services/local-storage.service';
import { TweetService } from './services/tweet.service';

@NgModule({
  imports: [
      CommonModule,
      ToolRoutingModule,
      MultiUseModule,
      MatSlideToggleModule,
      MatCheckboxModule,
      MatSliderModule,
      FormsModule
  ],
  providers: [ 
    GraphService,
    CommunicationService,
    LocalStorageService,
    TweetService
  ],
  declarations: [
      ToolComponent,
      HintComponent,
      TweetComponent,
      MainPanelComponent,
          GraphComponent,
          SettingsComponent,
          TourComponent,
          ZoomComponent,
          TimesliderComponent,
      SidePanelComponent,
          SearchbarComponent,
          ShareComponent,
          AccordeonsComponent,
              AccSourceComponent,
  ]
})
export class ToolModule { }

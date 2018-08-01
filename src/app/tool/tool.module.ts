import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolRoutingModule } from './tool-routing.module';
import { MultiUseModule } from '../multi-use/multi-use.module';

import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material';
import { MatRadioModule } from '@angular/material/radio';

import { ToolComponent } from './tool.component';
import { CookiePolicyComponent } from './cookie-policy.component';
import { HintComponent } from './multi-use/hint.component';
import { OverlayComponent } from './multi-use/overlay.component';
import { TweetComponent } from './multi-use/tweet.component';
import { TweetCardComponent } from './multi-use/tweet-card.component';
import { UserComponent } from './multi-use/user.component';
import { InfoButtonComponent } from './multi-use/info-button.component';
import { ChartComponent } from './multi-use/chart.component';
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
        import { AccInfluentialComponent } from './side-panel/accordeons/acc-influential.component';
        import { AccMetricsComponent } from './side-panel/accordeons/acc-metrics.component';
        import { AccEnhancedMetricsComponent } from './side-panel/accordeons/enhanced-metrics/acc-enhanced-metrics.component';
            import { EnhancedBarChartComponent } from './side-panel/accordeons/enhanced-metrics/acc-bar-chart.component';
            import { AccLineChartComponent } from './side-panel/accordeons/enhanced-metrics/acc-line-chart.component';
        import { AccLastTracemapsComponent } from './side-panel/accordeons/acc-last-tracemaps.component';
    import { UserDetailsComponent } from './side-panel/user/user-details.component';
        import { UserSettingsComponent } from './side-panel/user/user-settings.component';
        import { TimelineComponent } from './side-panel/user/timeline.component';

import { CommunicationService } from './services/communication.service';
import { GraphService } from './services/graph.service';
import { LocalStorageService } from './services/local-storage.service';
import { TweetService } from './services/tweet.service';
import { TourService } from './services/tour.service';

import { TimeLabelPipe } from './pipes/time-label.pipe';
import { ToYearPipe } from './pipes/to-year.pipe';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { LinkedStringPipe } from './pipes/linked-string.pipe';

@NgModule({
    imports: [
        CommonModule,
        ToolRoutingModule,
        MultiUseModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatSliderModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        FormsModule
    ],
    providers: [
      GraphService,
      CommunicationService,
      LocalStorageService,
      TweetService,
      TourService
    ],
    declarations: [
        ToolComponent,
        CookiePolicyComponent,
        HintComponent,
        OverlayComponent,
        TweetComponent,
        TweetCardComponent,
        UserComponent,
        InfoButtonComponent,
        ChartComponent,
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
                AccInfluentialComponent,
                AccMetricsComponent,
                AccEnhancedMetricsComponent,
                    EnhancedBarChartComponent,
                AccLineChartComponent,
                AccLastTracemapsComponent,
            UserDetailsComponent,
                UserSettingsComponent,
                TimelineComponent,
        TimeLabelPipe,
        ToYearPipe,
        ShortNumberPipe,
        LinkedStringPipe
    ]
})
export class ToolModule { }

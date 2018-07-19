import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { GraphService } from '../../services/graph.service';
import { CommunicationService } from '../../services/communication.service';
import { TimelineComponent } from './timeline.component';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})

export class UserDetailsComponent {

    @ViewChild(TimelineComponent)
    private timelineComponent: TimelineComponent;

    userId: string;
    userInfo: object;
    activeUserInfo: object;
    open = false;

    settingsOpen = false;
    timelineRendered = false;

    constructor(
        private route: ActivatedRoute,
        private graphService: GraphService,
        private communicationService: CommunicationService
    ) {
        const subscriptionParams = this.route.params.subscribe( (params: Params) => {
            if ( params['uid'] && params['uid'] !== this.userId) {
                this.graphService.activeNode.next(params['uid']);
            }
        });

        this.communicationService.userInfo.subscribe( userInfo => {
            if ( userInfo) {
                this.userInfo = userInfo;

                this.graphService.activeNode.subscribe( nodeId => {
                    if ( nodeId && nodeId !== this.userId) {
                        this.userId = nodeId;
                        this.timelineRendered = false;
                        this.activeUserInfo = this.userInfo[this.userId];
                        subscriptionParams.unsubscribe();
                        this.open = true;
                    } else if (!nodeId) {
                        this.open = false;
                    }
                });
            }
        });
    }

    closeUserInfo(): void {
        this.graphService.activeNode.next(undefined);
    }

    onTimelineScroll( event: any): void {
        if (this.timelineComponent.allTweetsRendered() ) {
            const timelineHeight = event.target.scrollHeight;
            const scrollPosition = event.target.scrollTop +
                                 event.target.offsetHeight;
            if ( timelineHeight - scrollPosition < 200) {
               this.timelineComponent.addShowedTweets();
            }
        }
    }

    changeTimelineRendered(event): void {
        this.timelineRendered = event;
    }

    toggleSettingsMenu(): void {
        this.settingsOpen ? this.settingsOpen = false : this.settingsOpen = true;
    }
}

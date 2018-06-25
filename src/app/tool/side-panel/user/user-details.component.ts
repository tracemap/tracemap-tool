import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { GraphService } from './../../services/graph.service';
import { CommunicationService } from './../../services/communication.service';

@Component({
    selector: 'user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})

export class UserDetailsComponent {

    userId: string;
    userInfo: object;
    activeUserInfo: object;
    open: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private graphService: GraphService,
        private communicationService: CommunicationService
    ){
        let params = this.route.params.subscribe( (params:Params) => {
            if( params["uid"] && params["uid"] != this.userId) {
                this.graphService.activeNode.next(params["uid"]);
            }
        });

        this.communicationService.userInfo.subscribe( userInfo => {
            if( userInfo) {
                this.userInfo = userInfo;
                console.log(this.userInfo);

                this.graphService.activeNode.subscribe( nodeId => {
                    if( nodeId && nodeId != this.userId) {
                        this.userId = nodeId;
                        this.activeUserInfo = this.userInfo[this.userId];
                        params.unsubscribe();
                        this.open = true;
                    }
                })
            }
        })
    }

    closeUserInfo():void {
        this.open = false;
        setTimeout( () => {
            this.graphService.activeNode.next(undefined);
        }, 400);
    }
}

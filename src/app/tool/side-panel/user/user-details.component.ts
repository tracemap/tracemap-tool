import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { GraphService } from './../../services/graph.service';

@Component({
    selector: 'user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})

export class UserDetailsComponent {

    userId: string;

    constructor(
        private route: ActivatedRoute,
        private graphService: GraphService
    ){
        this.route.params.subscribe( (params:Params) => {
            if( params["uid"] && this.userId != params["uid"]) {
                this.userId = params["uid"];
                this.graphService.activeNode.next(this.userId);
            } 
        })
    }

}

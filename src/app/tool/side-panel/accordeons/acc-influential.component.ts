import { Component, Output, EventEmitter } from '@angular/core';

import { GraphService } from '../../services/graph.service';
import { CommunicationService } from '../../services/communication.service';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'acc-influential',
    templateUrl: './acc-influential.component.html',
    styleUrls: ['./acc-influential.component.scss']
})

export class AccInfluentialComponent {
    @Output()
    rendered = new EventEmitter();
    sortedNodes;
    hovered: string;

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService,
        private apiService: ApiService
    ) {
        this.graphService.nodeList.subscribe( nodeList => {
            if ( nodeList) {
                this.sortedNodes = nodeList
                    .sort( (a, b) => b['out_degree'] - a['out_degree']).slice(0, 10);
                this.rendered.next(true);
            }
        });
        this.communicationService.resetData.subscribe( reset => {
            if ( reset) {
                this.rendered.next(false);
            }
        });
        this.graphService.userNodeHighlight.subscribe( userId => {
            this.hovered = userId;
        });
    }

    setHovered(userId) {
        this.graphService.userNodeHighlight.next(userId);
    }

    setActive(userId) {
        this.graphService.activeNode.next(userId);
    }

}

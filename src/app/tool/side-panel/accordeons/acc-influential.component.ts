import { Component, Output, EventEmitter } from '@angular/core';
import { GraphService } from './../../services/graph.service';

@Component({
    selector: 'acc-influential',
    templateUrl: './acc-influential.component.html',
    styleUrls: ['./acc-influential.component.scss']
})

export class AccInfluentialComponent {
    @Output()
    rendered = new EventEmitter();

    nodes: object[];
    userInfo: object;
    influentialNodes: object[];
    influentialUsers: object[];
    hovered: string;

    constructor(
        private graphService: GraphService
    ){
        this.graphService.nodeList.subscribe( nodeList => {
            if( nodeList) {
                this.nodes = nodeList;
                this.addInfluentialNodes();
            }
        })
        this.graphService.userInfo.subscribe( userInfo => {
            if( userInfo) {
                this.userInfo = userInfo;
                this.addInfluentialUsers();
            }
        })
    }

    addInfluentialNodes() {
        this.influentialNodes = this.nodes.sort((a, b) => {
            return b["out_degree"] - a["out_degree"];
        }).slice(0,10);
    }

    addInfluentialUsers() {
        let users = [];
        this.influentialNodes.forEach( node => {
            let user = this.userInfo[node["id_str"]];
            user["id_str"] = node["id_str"];
            user["out_degree"] = node["out_degree"];
            users.push(user);
        })
        this.influentialUsers = users;
        this.rendered.next(true);
    }

}

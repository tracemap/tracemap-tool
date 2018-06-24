import { Component, Output, EventEmitter } from '@angular/core';

import { GraphService } from './../../services/graph.service';
import { CommunicationService } from './../../services/communication.service';
import { ApiService } from './../../../services/api.service';

@Component({
    selector: 'acc-influential',
    templateUrl: './acc-influential.component.html',
    styleUrls: ['./acc-influential.component.scss']
})

export class AccInfluentialComponent {
    @Output()
    rendered = new EventEmitter();

    nodes: object[];
    influentialUsers: object[];
    hovered: string;

    constructor(
        private graphService: GraphService,
        private communicationService: CommunicationService,
        private apiService: ApiService
    ){
        this.graphService.nodeList.subscribe( nodeList => {
            if( nodeList) {
                this.nodes = nodeList;
                this.getInfluentialNodes().then( influentialNodes => {
                    this.addInfluentialUsers( influentialNodes);
                });
            }
        })
        this.communicationService.resetData.subscribe( reset => {
            if( reset) {
                this.rendered.next(false);
            }
        })
        this.graphService.userNodeHighlight.subscribe( userId => {
            this.hovered = userId;
        })
    }

    getInfluentialNodes(): Promise<object> {
        return new Promise( (resolve, reject) => {
            let influentialNodes = this.nodes.sort((a, b) => {
                return b["out_degree"] - a["out_degree"];
            }).slice(0,10);
            resolve( influentialNodes);
        })
    }

    addInfluentialUsers( influentialNodes) {
        let users = [];
        let nodeIds = influentialNodes.map( node => node.id_str);
        this.communicationService.getUserInfo( nodeIds).then( userInfos => {
            influentialNodes.forEach( node => {
                let userInfo = userInfos[node.id_str];
                userInfo["id_str"] = node.id_str;
                userInfo["out_degree"] = node.out_degree;
                users.push(userInfo);
            })
            users.sort( (a, b) => b.out_degree - a.out_degree);
            this.influentialUsers = users;
            this.rendered.next(true);
        })
        // influentialNodes.forEach( (node, index) => {
        //     let nodeId = node["id_str"];
        //     let userInfo = this.communicationService.userInfo[nodeId];
        //     if( !userInfo) {
        //         this.apiService.getUserInfo(nodeId).subscribe( userInfo => {
        //             this.communicationService.userInfo[nodeId] = userInfo[nodeId];
        //             userInfo = userInfo[nodeId];
        //             userInfo["id_str"] = node["id_str"];
        //             userInfo["out_degree"] = node["out_degree"];
        //             users.push(userInfo);
        //             if( users.length == influentialNodes.length) {
        //                 users.sort( (a, b) => b.out_degree - a.out_degree);
        //                 this.influentialUsers = users;
        //                 this.rendered.next(true);
        //             }
        //         });
        //     }
        // })
    }

    setHovered(userId) {
        this.graphService.userNodeHighlight.next(userId);
    }

    setActive(userId) {
        this.graphService.activeNode.next(userId);
    }

}

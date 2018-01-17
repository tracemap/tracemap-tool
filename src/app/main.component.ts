import { Component, AfterViewInit, OnChanges, ViewChild, NgModule } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: []
})

export class MainComponent implements AfterViewInit, OnChanges {
    @ViewChild('d3Component') d3Component;

    tracemapId: string;
    tracemapData: object;
    relations: object[];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService
    ) {}

    ngAfterViewInit(): void {
        this.tracemapId = this.route.params["_value"]["pid"];

        this.apiService.getTracemapData( this.tracemapId)
            .then( tracemapData => {
                this.tracemapData = tracemapData;
                this.addGraphData();
        });
    }

    addGraphData(): void {
        console.log(this.tracemapData);
        let graphData = {
            "nodes": [],
            "links": []
        };

        let source = {};

        source['id'] = this.tracemapData['tweet_info'][this.tracemapId]['author'];
        source['group'] = 0;
        graphData['nodes'].push(source);

        this.tracemapData['retweeters'].forEach(user => {
            let node = {};
            node['id'] = user;
            node['group'] = 1;
            graphData['nodes'].push(node);
            console.log("Node added");

        });
        graphData['nodes'].forEach( source => {
            if( source['id'] in this.tracemapData['followers']) {
                this.tracemapData['followers'][source['id']].forEach( target => {
                    let link = {};
                    link['source'] = source['id'];
                    link['target'] = target;
                    link['value'] = 1;
                    graphData['links'].push(link);
                });
            }
        });

        this.tracemapData['graphData'] = graphData;
        this.d3Component.graphData = this.tracemapData['graphData'];
        this.d3Component.render();
        console.log(this.tracemapData['followers'])
    }

    openUserInfo(userId: string): void {
        this.router.navigate(['details', userId], {relativeTo: this.route});
    }

    closeUserInfo(): void {
        this.router.navigate(['./'], {relativeTo: this.route});
    }

    ngOnChanges(): void {
        console.log("TM-ID: " + this.tracemapId);
    }
}
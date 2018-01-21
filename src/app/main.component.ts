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
    @ViewChild('userinfo') userComponent;

    tracemapId: string;
    tracemapData: object;
    relations: object[];
    graphData: object;

    newMode = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService
    ) {}

    createSubDict(sourceDict: object, keys: string[]): Promise<object> {
        return new Promise( (resolve, reject) => {
            let subDict = {};
            keys.map( key => {
                subDict[key] = sourceDict[key];
            });
            resolve( subDict);
        });

    }

    ngAfterViewInit(): void {
        this.tracemapId = this.route.params["_value"]["pid"];

        let authorKeys = [
            'id_str',
            'favourites_count',
            'followers_count',
            'friends_count'
        ];

        this.apiService.getTracemapData( this.tracemapId)
            .then( tracemapData => {
                this.tracemapData = tracemapData;
                let authorInfo = this.tracemapData['tweet_data']['tweet_info']['user']
                return this.createSubDict(authorInfo, authorKeys);
            }).then( graphAuthorInfo => {
                this.graphData = {};
                this.graphData['author_info'] = graphAuthorInfo;
                this.graphData['author_info']['group'] = 0;
                let retweetersInfo = this.tracemapData['tweet_data']['retweet_info']
                this.graphData['retweet_info'] = {};
                let promiseArray:Array<any> = [];
                this.tracemapData['tweet_data']['retweeter_ids'].forEach( retweeterId => {
                    let retweeterInfo = retweetersInfo[retweeterId]['user'];
                    let tmp = {};
                    tmp['favourites_count'] = retweeterInfo['favourites_count'];
                    tmp['followers_count'] = retweeterInfo['followers_count'];
                    tmp['friends_count'] = retweeterInfo['friends_count'];
                    tmp['retweet_created_at'] = retweetersInfo[retweeterId]['created_at'];
                    this.graphData['retweet_info'][retweeterId] = tmp;
                });
                this.addGraphData();
            });
    }

    addGraphData(): void {
        let graphElements = {
            "nodes": [],
            "links": []
        };


        this.tracemapData['tweet_data']['retweeter_ids'].forEach( retweeter => {
            let node = this.graphData['retweet_info'][retweeter];
            node['id_str'] = retweeter;
            node['group'] = 1
            graphElements['nodes'].push(node);
        });

        let authorId = this.graphData['author_info']['id_str']
        let followers = this.tracemapData['followers']

        if(authorId in followers && this.newMode) {
            // New mechanic if author is in our database
            let connectedUsers = [];
            let checkedUsers = [];

            followers[authorId].forEach( targetId => {
                connectedUsers.push(targetId);
                checkedUsers.push(targetId);
                graphElements['links'].push({
                    'source':authorId,
                    'target':targetId
                });
            });

            let oldLinkNum = graphElements['links'].length;
            let newLinkNum = oldLinkNum + 1;

            while( oldLinkNum !== newLinkNum) {
                let tmpConnectedUsers = [];
                oldLinkNum = newLinkNum;
                connectedUsers.forEach( sourceId => {
                    if( sourceId in followers) {
                        followers[sourceId].forEach( targetId => {
                            if( targetId !== authorId) {
                                let sourceDate = this.graphData['retweet_info'][sourceId]['retweet_created_at'];
                                let targetDate = this.graphData['retweet_info'][targetId]['retweet_created_at'];

                                if( Date.parse(sourceDate) < Date.parse(targetDate)) {
                                    if( checkedUsers.indexOf(targetId) < 0){
                                        tmpConnectedUsers.push(targetId);
                                        checkedUsers.push(targetId);
                                    }
                                    graphElements['links'].push({
                                        'source': sourceId,
                                        'target': targetId,
                                    });
                                }
                            }
                        });
                    }
                });
                connectedUsers = tmpConnectedUsers;
                newLinkNum = graphElements['links'].length;
            }
            graphElements['nodes'].push(this.graphData['author_info']);
        } else {
            // Old mechanic for tweets where the author isnt in our database
            if(authorId in followers){
                console.log("THE APP IS RUNNING WITH OLD GRAPH LOGIC");
                followers[authorId].forEach( targetId => {
                    graphElements['links'].push({
                        'source':authorId,
                        'target':targetId
                    });
                });
            } else {
                console.log("THE AUTHOR OF THE TWEET IS NOT IN OUR DATABASE");
            }

            graphElements['nodes'].push(this.graphData['author_info']);
            graphElements['nodes'].forEach( source => {
                let sourceId = source['id_str'];
                if( sourceId in followers) {
                    followers[sourceId].forEach( targetId => {
                        if( !(targetId === authorId || sourceId === authorId)) {
                            let sourceDate = this.graphData['retweet_info'][sourceId]['retweet_created_at'];
                            let targetDate = this.graphData['retweet_info'][targetId]['retweet_created_at'];

                            if( Date.parse(sourceDate) < Date.parse(targetDate)) {
                                graphElements['links'].push({
                                    'source': sourceId,
                                    'target': targetId
                                });
                            }
                        }
                    });
                }
            });
        }

        this.tracemapData['graphData'] = graphElements;
        this.d3Component.graphData = this.tracemapData['graphData'];
        this.d3Component.render();
    }

    openUserInfo(userId: string): void {
        this.router.navigate(['details', userId], {relativeTo: this.route});
    }

    closeUserInfo(): void {
        this.router.navigate(['./'], {relativeTo: this.route});
    }

    ngOnChanges(): void {
    }
}
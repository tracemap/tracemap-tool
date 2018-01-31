import { 
    Component, 
    AfterViewInit, 
    OnChanges, 
    ViewChild, 
    NgModule } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApiService } from './api.service';
import { MainCommunicationService } from './main.communication.service';


@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: []
})

export class MainComponent implements AfterViewInit, OnChanges {
    @ViewChild('d3Component') d3Component;
    @ViewChild('userinfo') userComponent;
    @ViewChild('info') infoComponent;

    tracemapId: string;
    tracemapData: object;
    relations: object[];
    graphData: object;

    newMode = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private comService: MainCommunicationService
    ) {
        this.loadTwitterWidgetScript();
        if (this.route.firstChild.params['_value']['uid']){
            let userId = this.route.firstChild.params['_value']['uid'];
            this.comService.userInfo.next( userId);
        }
    }

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
        this.comService.userInfo.subscribe( userId => {
            if(userId){
                this.openUserInfo( userId);
            } else {
                this.closeUserInfo();
            }
        });
        this.route.params.subscribe(
            (params: Params) => {
            this.tracemapId = params["pid"];

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
        );
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
                                if( this.targetTweetNewer(sourceId, targetId)) {
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
                this.graphData['auther_unknown'] = true;
                console.log("THE AUTHOR OF THE TWEET IS NOT IN OUR DATABASE");
            }

            graphElements['nodes'].push(this.graphData['author_info']);
            graphElements['nodes'].forEach( source => {
                let sourceId = source['id_str'];
                if( sourceId in followers) {
                    followers[sourceId].forEach( targetId => {
                        if( !(targetId === authorId || sourceId === authorId)) {
                            if( this.targetTweetNewer(sourceId, targetId)) {
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

        this.graphData['nodes'] = graphElements['nodes'];
        this.graphData['links'] = graphElements['links'];
        this.d3Component.graphData = this.graphData;
        this.apiService.graphData.next(this.graphData);
        this.d3Component.render();
    }

    targetTweetNewer( sourceId: string, targetId: string): boolean {
        let sourceDate = this.graphData['retweet_info']
                                       [sourceId]
                                       ['retweet_created_at'];
        let targetDate = this.graphData['retweet_info']
                                       [targetId]
                                       ['retweet_created_at'];
        if( sourceDate < targetDate) {
            return true;
        } else {
            return false;
        }
    }

    openUserInfo(userId: string): void {
        this.router.navigate(['details', userId], {relativeTo: this.route});
    }

    closeUserInfo(): void {
        this.router.navigate(['./'], {relativeTo: this.route});
    }

    ngOnChanges(): void {
    }

    loadTwitterWidgetScript(): void {
        window['twttr'] = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window['twttr'] || {};
            if (d.getElementById(id)){
                return t;
            };
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;
        })(document, "script", "twitter-wjs");
    }
}
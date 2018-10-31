import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../services/api.service';
import { GraphService } from './services/graph.service';
import { CommunicationService } from './services/communication.service';
import { LocalStorageService } from './services/local-storage.service';

@Component({
    selector: 'tool',
    templateUrl: './tool.component.html',
    styleUrls: ['./tool.component.scss']
})

export class ToolComponent implements OnInit {

    tweetId: string;
    userId: string;
    tracemapData: object;
    graphData: object;
    userInfos: object = {};
    newMode = false;
    cookiePolicyOpen = false;
    // Show if more than 100 retweets
    exceedOverlayOpen = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private graphService: GraphService,
        private communicationService: CommunicationService,
        private localStorageService: LocalStorageService,
    ) {
        this.loadTwitterWidgetScript();
        this.graphService.graphData.subscribe( graphData => {
            if ( graphData) {
                const nodeIds = graphData['nodes'].map( node => {
                    return node.id_str;
                }).toString();
            }
        });

        const cookieSettings = this.localStorageService.getSettings();
        if ( !cookieSettings) {
            this.localStorageService.showPolicy.next(true);
            this.communicationService.firstTimeVisitor.next(true);
        } else {
            this.communicationService.cookieOverlayClosed.next(true);
        }
        this.localStorageService.showPolicy.subscribe( showPolicy => {
            if ( !showPolicy) {
                this.cookiePolicyOpen = false;
                this.communicationService.cookieOverlayClosed.next(true);
            } else {
                this.cookiePolicyOpen = true;
            }
        });
        this.graphService.activeNode.subscribe( userId => {
            if ( userId &&
                this.userId !== userId) {
                this.userId = userId;
                this.router.navigate(['details', userId], {relativeTo: this.route});
            } else if ( !userId && this.userId) {
                this.userId = undefined;
                setTimeout( () => {
                    this.router.navigate(['./'], {relativeTo: this.route});
                }, 400);
            }
        });
    }

    createSubDict(sourceDict: object, keys: string[]): Promise<object> {
        return new Promise( (resolve, reject) => {
            const subDict = {};
            keys.map( key => {
                subDict[key] = sourceDict[key];
            });
            resolve( subDict);
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe( (params: Params) => {
            if (this.tweetId !== params['tid']) {
                this.tweetId = params['tid'];
                this.communicationService.resetData.next(true);
                this.communicationService.tweetId.next(params['tid']);
            }
            if ( params['uid']) {
                this.graphService.activeNode.next(params['uid']);
            }

            this.apiService.getTracemapData( this.tweetId)
                .then( tracemapData => {
                    // clear old userInfos
                    this.userInfos = {};

                    // show extends overlay if more than 100 retweets
                    const retweetCount = tracemapData['tweet_data']['tweet_info']['retweet_count'];
                    if (retweetCount > 100) {
                        this.exceedOverlayOpen = true;
                        this.communicationService.exceedOverlayClosed.next(false);
                    } else {
                        this.communicationService.exceedOverlayClosed.next(true);
                    }

                    const authorKeys = [
                        'id_str',
                        'favourites_count',
                        'followers_count',
                        'friends_count'
                    ];

                    this.tracemapData = tracemapData;

                    const retweets = this.tracemapData['tweet_data']['tweet_info']['retweet_count'];
                    this.communicationService.retweetCount.next(retweets);

                    const authorInfo = this.tracemapData['tweet_data']['tweet_info']['user'];
                    this.userInfos[authorInfo['id_str']] = authorInfo;
                    return this.createSubDict(authorInfo, authorKeys);
                }).then( graphAuthorInfo => {
                    this.graphData = {};
                    this.graphData['author_info'] = graphAuthorInfo;
                    this.graphData['author_info']['group'] = 0;
                    this.graphData['author_info']['retweet_created_at'] = this.tracemapData['tweet_data']['tweet_info']['created_at'];
                    const retweetersInfo = this.tracemapData['tweet_data']['retweet_info'];
                    this.graphData['retweet_info'] = {};
                    const promiseArray: Array<any> = [];
                    this.tracemapData['tweet_data']['retweeter_ids']
                        .forEach( retweeterId => {
                            console.log(retweeterId);
                            const retweeterInfo = retweetersInfo[retweeterId]['user'];
                            const tmp = {};
                            tmp['favourites_count'] = retweeterInfo['favourites_count'];
                            tmp['followers_count'] = retweeterInfo['followers_count'];
                            tmp['friends_count'] = retweeterInfo['friends_count'];
                            tmp['retweet_created_at'] = retweetersInfo[retweeterId]['created_at'];
                            this.graphData['retweet_info'][retweeterId] = tmp;
                            this.userInfos[retweeterId] = retweeterInfo;
                        });
                    this.communicationService.userInfo.next(this.userInfos);
                    this.addGraphData();
                });
        });
    }

    addGraphData(): void {
        const graphElements = {
            'nodes': [],
            'links': []
        };

        const authorId = this.graphData['author_info']['id_str'];
        const followers = this.tracemapData['followers'];
        const retweeterIds = this.tracemapData['tweet_data']['retweeter_ids'];

        this.communicationService.userIds.next(retweeterIds.concat([authorId]));

        // Necessary because the twitter api sometimes returns users multiple times
        const nodesChecked = [];
        console.log(this.tracemapData);
        this.tracemapData['tweet_data']['retweeter_ids'].forEach( retweeter => {
            if ( nodesChecked.indexOf(retweeter) < 0) {
                nodesChecked.push(retweeter);
                if (retweeter !== authorId) {
                    const node = this.graphData['retweet_info'][retweeter];
                    node['id_str'] = retweeter;
                    node['group'] = 1;
                    graphElements['nodes'].push(node);
                }
            }
        });

        // Old mechanic for tweets where the author isnt in our database
        if (authorId in followers) {
            followers[authorId].forEach( targetId => {
                graphElements['links'].push({
                    'source': authorId,
                    'target': targetId
                });
            });
        } else {
            this.graphData['auther_unknown'] = true;
            console.log('author missing');
        }

        graphElements['nodes'].push(this.graphData['author_info']);
        graphElements['nodes'].forEach( source => {
            const sourceId = source['id_str'];
            if ( sourceId in followers) {
                followers[sourceId].forEach( targetId => {
                    if ( !(targetId === authorId || sourceId === authorId)) {
                        if ( this.targetTweetNewer(sourceId, targetId)) {
                            graphElements['links'].push({
                                'source': sourceId,
                                'target': targetId
                            });
                        }
                    }
                });
            }
        });

        const linkSources = graphElements['links'].map( link => {
            return link['source'];
        });
        const linkTargets = graphElements['links'].map( link => {
            return link['target'];
        });
        this.graphData['nodes'] = [];
        // just return nodes with connected links
        graphElements['nodes'].forEach( (node) => {
            if ( linkSources.indexOf(node['id_str']) >= 0 ||
                linkTargets.indexOf(node['id_str']) >= 0) {
                this.graphData['nodes'].push(node);
            }
        });
        this.graphData['links'] = graphElements['links'];

        this.graphService.graphData.next(this.graphData);
    }

    targetTweetNewer( sourceId: string, targetId: string): boolean {
        const sourceTimestamp = Date.parse(this.graphData['retweet_info']
                                       [sourceId]
                                       ['retweet_created_at']);
        const targetTimestamp = Date.parse(this.graphData['retweet_info']
                                       [targetId]
                                       ['retweet_created_at']);
        if ( sourceTimestamp < targetTimestamp) {
            return true;
        } else {
            return false;
        }
    }

    closeExceedOverlay(): void {
        this.exceedOverlayOpen = false;
        this.communicationService.exceedOverlayClosed.next(true);
    }

    loadTwitterWidgetScript(): void {
        window['twttr'] = (function(d, s, id) {
            let js, fjs = d.getElementsByTagName(s)[0],
                t = window['twttr'] || {};
            if (d.getElementById(id)) {
                return t;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;
        }(document, 'script', 'twitter-wjs'));
    }
}

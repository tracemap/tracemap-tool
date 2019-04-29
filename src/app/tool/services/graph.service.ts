import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TwitterDataService } from './twitter-data.service';
import { getTypeNameForDebugging } from '@angular/core/src/change_detection/differs/iterable_differs';

@Injectable()

export class GraphService {
    graphData = new BehaviorSubject<object>(undefined);
    nodeList = new BehaviorSubject<object[]>(undefined);
    timeRange = new BehaviorSubject<number>(undefined);
    relTimestampList = new BehaviorSubject<number[]>(undefined);
    timesliderPosition = new BehaviorSubject<number>(undefined);
    settings = new BehaviorSubject<object>(undefined);
    rendered = new BehaviorSubject<boolean>(undefined);
    userNodeHighlight = new BehaviorSubject<string>(undefined);
    activeNode = new BehaviorSubject<string>(undefined);

    constructor(
        private twitterDataService: TwitterDataService
    ) {
        this.twitterDataService.isSet.subscribe( isSet => {
            if (isSet) {
                this.setGraphData();
            }
        });
    }

    setGraphData() {
        const nodes = [];
        const links = [];
        // push author to the nodes list
        const authorInfo = this.twitterDataService.tweetObject['user'];
        const authorId = authorInfo['id_str'];
        nodes.push({
            id_str: authorId,
            favourites_count: authorInfo['favourites_count'],
            followers_count: authorInfo['followers_count'],
            friends_count: authorInfo['friends_count'],
            retweet_created_at: this.twitterDataService.tweetObject['created_at'],
            group: 0
        });
        // push retweeters to the nodes list
        // add trivial links from the author
        this.twitterDataService.retweetIds.forEach( retweeterId => {
            const retweetInfo = this.twitterDataService.retweetObjects[retweeterId];
            const retweeterInfo = retweetInfo['user'];
            if (retweeterId !== authorId) {
                nodes.push({
                    id_str: retweeterId,
                    favourites_count: retweeterInfo['favourites_count'],
                    followers_count: retweeterInfo['followers_count'],
                    friends_count: retweeterInfo['friends_count'],
                    retweet_created_at: retweetInfo['created_at'],
                    group: 1
                });
                links.push({
                    target: retweeterId,
                    source: authorId
                });
            }
        });
        this.graphData.next({
            nodes: nodes,
            links: links
        });
    }
}

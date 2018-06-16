import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()

export class GraphService {
    graphData = new BehaviorSubject<object>(undefined);
    nodeList = new BehaviorSubject<object[]>(undefined);
    userInfo = new BehaviorSubject<object>(undefined);
    timeRange = new BehaviorSubject<number>(undefined);
    relTimestampList = new BehaviorSubject<number[]>(undefined);
    timesliderPosition = new BehaviorSubject<number>(undefined);
    settings = new BehaviorSubject<object>(undefined);
    rendered = new BehaviorSubject<boolean>(undefined);
    userNodeHighlight = new BehaviorSubject<string>(undefined);
}

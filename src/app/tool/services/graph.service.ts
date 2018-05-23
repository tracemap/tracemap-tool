import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()

export class GraphService {
    graphData = new BehaviorSubject<object>(undefined);
    timeRange = new BehaviorSubject<number>(undefined);
    timesliderPosition = new BehaviorSubject<number>(undefined);
}

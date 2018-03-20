import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class MainCommunicationService {

    userNodeHighlight = new BehaviorSubject<string>(undefined);
    resetUserNodeHighlight = new BehaviorSubject<string>(undefined); 
    userInfo = new BehaviorSubject<string>(undefined);
    author = new BehaviorSubject<string>(undefined);
    backendError = new BehaviorSubject<string>(undefined);
    searchbarStyle = new BehaviorSubject<string>(undefined);
}

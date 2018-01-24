import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class MainCommunicationService {

    userNodeHighlight = new BehaviorSubject<string>(undefined);
    resetUserNodeHighlight = new BehaviorSubject<string>(undefined); 
    openUserInfo = new BehaviorSubject<string>(undefined);
    closeUserInfo = new BehaviorSubject<string>(undefined);
}
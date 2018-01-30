import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class MainCommunicationService {

    userNodeHighlight = new BehaviorSubject<string>(undefined);
    resetUserNodeHighlight = new BehaviorSubject<string>(undefined); 
    userInfo = new BehaviorSubject<string>(undefined);
    
}
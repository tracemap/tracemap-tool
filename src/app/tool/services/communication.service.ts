import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class CommunicationService {
    retweetCount = new BehaviorSubject<number>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
}

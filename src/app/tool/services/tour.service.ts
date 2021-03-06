import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class TourService {
    graphSettingsOpen = new BehaviorSubject<boolean>(undefined);
    userSettingsOpen = new BehaviorSubject<boolean>(undefined);
    cloudSettingsOpen = new BehaviorSubject<boolean>(undefined);
    openAccordeon = new BehaviorSubject<string>(undefined);
}

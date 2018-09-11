import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class WordcloudService {
    timelineTexts = new BehaviorSubject<string[]>(undefined);
}

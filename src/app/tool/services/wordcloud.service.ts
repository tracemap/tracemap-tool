import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable( )

export class WordcloudService {
    timelineTexts = new BehaviorSubject<string[]>(undefined);
    selectedWord = new BehaviorSubject<string>(undefined);
}

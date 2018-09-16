import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable( )

export class WordcloudService {
    timelineTexts = new ReplaySubject<string[]>(1);
}

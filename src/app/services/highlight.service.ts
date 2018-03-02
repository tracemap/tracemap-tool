import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable( )

export class HighlightService {
    highlight = new BehaviorSubject<string>(undefined);
}

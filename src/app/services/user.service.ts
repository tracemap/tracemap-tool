import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()

export class UserService {
    credentials = new BehaviorSubject<object>(undefined);
}

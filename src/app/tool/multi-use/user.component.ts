import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';

import { CommunicationService } from '../services/communication.service';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnChanges{
    @Input('name')
    name: string;
    @Input('screenName')
    screenName: string;
    @Input('image')
    image: string;
    @Input()
    userId: string;
    @Output()
    rendered = new EventEmitter(false);

    constructor(
        private communicationService: CommunicationService
    ) {}

    ngOnChanges() {
        if ( this.userId) {
            const userIdList = [];
            userIdList.push( this.userId);
            this.communicationService.getUserInfo(userIdList).then( userInfo => {
                const info = userInfo[this.userId];
                this.name = info.name;
                this.screenName = info.screen_name;
                this.image = 'https://twitter.com/' + info.screen_name + '/profile_image';
                this.rendered.next(true);
            });
        }
    }
}

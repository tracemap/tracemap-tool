import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnChanges {
    @Input()
    userId: string;
    @Output()
    rendered = new EventEmitter(false);

    image: string;
    name: string;
    screenName: string;

    constructor(
        private communicationService: CommunicationService,
    ) {}

    ngOnChanges() {
        if ( this.userId) {
            this.communicationService.getUserInfo(this.userId).then( info => {
                this.name = info['name'];
                this.screenName = info['screen_name'];
                this.image = info['profile_image_url_https'];
                this.rendered.next(true);
            }).catch(() => { console.log('user info not present'); });
        }
    }
}

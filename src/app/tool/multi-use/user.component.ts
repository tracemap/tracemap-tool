import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { TwitterDataService } from '../services/twitter-data.service';
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
        private twitterDataService: TwitterDataService
    ) {}

    ngOnChanges() {
        if ( this.userId) {
            const userInfo = this.twitterDataService.getUserInfo(this.userId);
            if (userInfo) {
                this.name = userInfo['name'];
                this.screenName = userInfo['screen_name'];
                this.image = userInfo['profile_image_url_https'];
                this.rendered.next(true);
            }
        }
    }
}

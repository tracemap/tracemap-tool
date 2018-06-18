import { Component, Input,Output, OnChanges, EventEmitter } from '@angular/core';
import { ApiService } from './../../services/api.service';

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
    @Input('id')
    userId: string;
    @Output()
    rendered = new EventEmitter(false);

    constructor(
        private apiService: ApiService
    ){}

    ngOnChanges() {
        if( this.userId) {
            this.apiService.getUserInfo(this.userId).subscribe( userInfo => {
                let info = userInfo[this.userId];
                this.name = info.name;
                this.screenName = info.screen_name;
                this.image = info.profile_image_url;
                this.rendered.next(true);
            })
        }
    }
}

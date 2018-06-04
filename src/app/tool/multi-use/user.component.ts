import { Component, Input } from '@angular/core';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})

export class UserComponent {
    @Input('name')
    name: string;
    @Input('screenName')
    screenName: string;
    @Input('image')
    image: string;
}

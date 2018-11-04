import { Component } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { ApiService } from '../../services/api.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/operator/takeWhile';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})

export class ProgressBarComponent {
    tweetId: string;
    users: string[];
    uncrawledUsers: string[];
    unwrittenUsers: string[];
    active = false;
    finished = false;
    collapsed = true;

    constructor(
        private communicationService: CommunicationService,
        private apiService: ApiService
    ) {
        this.communicationService.userIds.subscribe( userIds => {
            if (userIds) {
                this.users = userIds;
                this.apiService.labelUnknownUsers(userIds).subscribe( response => {
                    this.unwrittenUsers = response['unwritten'];
                    this.uncrawledUsers = response['uncrawled'];
                    if (this.unwrittenUsers.concat(this.uncrawledUsers).length > 0) {
                        this.checkMissingUsers();
                    }
                });
            }
        });
        this.communicationService.tweetId.subscribe( tweetId => {
            if (this.tweetId !== tweetId) {
                this.active = false;
                this.finished = true;
                this.tweetId = tweetId;
            }
        });
    }

    checkMissingUsers(): void {
        this.active = true;
        setTimeout( () => {
            this.collapsed = false;
        }, 500);
        this.finished = false;
        TimerObservable
        .create(5000, 5000)
        .takeWhile(() => !this.finished)
        .subscribe(() => {
            this.apiService.labelUnknownUsers(
                    this.uncrawledUsers.concat(this.unwrittenUsers)
                    ).subscribe( response => {
                this.unwrittenUsers = response['unwritten'];
                this.uncrawledUsers = response['uncrawled'];
                if (this.unwrittenUsers.concat(this.uncrawledUsers).length === 0) {
                    this.finished = true;
                }
            });
        });
    }

    reload(): void {
        location.reload();
    }

    toggleCollapse(): void {
        this.collapsed ? this.collapsed = false : this.collapsed = true;
    }
}

import { Component } from '@angular/core';
import { MainCommunicationService } from './main.communication.service';
import { HighlightService } from './highlight.service';

@Component({
    selector: 'help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss']
})

export class HelpComponent {
    hints: object[] = [
        {
            "headline":"Tutorial",
            "text":"I can tell you more about how to use the tool.",
            "view":"tm-details"
        },{
            "headline":"The Network-Graph",
            "text": "Here you can see all the users which shared the tweet and how the tweet got through this network.",
            "highlight": "graph",
            "view": "tm-details"
        },{
            "headline": "TraceMap Details",
            "text": "This area shows basic information about the TraceMap.",
            "highlight": "tm-details",
            "view": "tm-details"
        },{
            "headline": "Influential Users",
            "text": "These are the people in the TraceMap, with the most potential retweeters.",
            "highlight": "tm-influent",
            "view": "tm-details"
        },{
            "headline": "Inspect Users",
            "text": "Click on a user in the TraceMap or in the list of influential users to insepect them. The focused user has a blue outline in the TraceMap.",
            "view": "user-details"
        },{
            "headline": "User Details",
            "text": "Here you can see the users details. Click on the details to see their profile on Twitter.",
            "highlight": "user-details",
            "view": "user-details"
        },{
            "headline": "Timeline",
            "text": "You can scroll through the other tweets of the user and generate TraceMaps of them. Sort them by time or number of retweets or include tweets which where retweeted by this user.",
            "highlight": "timeline",
            "view": "user-details"
        },{
            "headline": "Overview",
            "text": "Click anywhere next to the TraceMap to close the user info.",
            "view": "user-details"
        }
    ];
    prev_disable: boolean = true;
    next_disable: boolean = false;
    index: number = 0;
    hint: object;
    disabled: string;

    author: string;
    focusedUser: string;

    constructor(
        private highlightService: HighlightService,
        private comService: MainCommunicationService
    ){
        this.hint = this.hints[this.index];

        this.comService.userInfo.subscribe( userId => {
            if(userId) {
                this.focusedUser = userId;
            }
        });

        this.comService.author.subscribe( authorId => {
            if( authorId) {
                this.author = authorId;
                if( !this.focusedUser) {
                    this.focusedUser = this.author;
                }
            }
        });
    }

    nextHelp(): void {
        this.index += 1;
        this.hint = this.hints[this.index];
        this.changeHighlight();
        this.prev_disable = false;
        if( !this.hints[this.index + 1]) {
            this.next_disable = true;
        }
    }

    prevHelp(): void {
        this.index -= 1;
        this.hint = this.hints[this.index];
        this.changeHighlight();
        this.next_disable = false;
        if( this.index == 0) {
            this.prev_disable = true;
        }
    }

    changeHighlight(): void {
        if(this.comService.userInfo.value && this.hint['view'] == "tm-details") {
            this.comService.userInfo.next(undefined);
        }
        if(!this.comService.userInfo.value && this.hint['view'] == "user-details") {
            this.comService.userInfo.next(this.focusedUser);
            console.log("user info open");
        }
        if( this.hints[this.index]["highlight"]) {
            let highlight = this.hints[this.index]["highlight"]
            this.highlightService.highlight.next(highlight);
            setTimeout( () => {
                this.highlightService.highlight.next("");
            },1000);
        } else {
            this.highlightService.highlight.next("");
        }
    }

    closeHelp(): void {
        this.disabled = "disabled";
        this.highlightService.highlight.next("");
    }
}

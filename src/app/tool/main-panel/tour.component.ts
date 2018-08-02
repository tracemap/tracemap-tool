import { Component } from '@angular/core';

import { TourService } from './../services/tour.service';
import { GraphService } from './../services/graph.service';

import * as $ from 'jquery';

@Component({
    selector: 'tour',
    templateUrl: './tour.component.html',
    styleUrls: ['./../multi-use/tooltip.scss', './tour.component.scss']
})

export class TourComponent {
    introOpen = false;
    tourOpen = false;
    chosenUserId: string;

    activeNodeSubscription;
    tourOverlayHidden = false;

    userDetailsOpen = false;

    activeItem: number;

    data = [
        {
            head: 'The Network Graph',
            text: 'You can see how the information got to each users by looking at the connections between them.<br>' +
                'Bigger nodes indicate more influential users',
            selectors: ['.graph'],
            styles: {
                top: '100px',
                left: '100px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: undefined,
                post_value: undefined
            }
        }, {
            head: 'The Time-Slider',
            text: 'Use this Slider to view the Network of any moment of time after the creation of the tweet.',
            selectors: ['.timeslider', '.graph'],
            styles: {
                bottom: '90px',
                left: '50%'
            },
            service_action: undefined
        }, {
            head: 'Graph Settings',
            text: 'In the settings of a graph you can change the appearence of the network or the behavior of dragged nodes.',
            selectors: ['.graph', '.settings'],
            styles: {
                bottom: '100px',
                right: '500px'
            },
            service_action: {
                subject: 'graphSettingsOpen',
                pre_value: true,
                post_value: false
            }
        }, {
            head: 'The Source Tweet',
            text: 'This is the Tweet on which everything is based and the amount of users which retweeted it.',
            selectors: ['.acc-source'],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-source',
                post_value: undefined
            }
        }, {
            head: 'Influential Users',
            text: 'Here we simply give you a list of the users, from which the most people potentially retweeted.',
            selectors: ['.acc-source', '.acc-influential'],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-influential',
                post_value: undefined
            }
        }, {
            head: 'Metrics',
            text: 'These are some basic metrics we calculate from the network graph or user data we receive from twitter.',
            selectors: ['.acc-source', '.acc-influential', '.acc-metrics'],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-metrics',
                post_value: undefined
            }
        }, {
            head: 'Charts',
            text: 'With these charts you can analyse e.g. how many followers each user has compared to their tweets authored.<br>' +
                'You can also move the slider to see the retweets by time changing accordingly.',
            selectors: [
                '.acc-source',
                '.acc-influential',
                '.acc-metrics',
                '.acc-enhanced-metrics'
            ],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-enhanced-metrics',
                post_value: undefined
            }
        }, {
            head: 'Last TraceMaps',
            text: 'Wanna go back?<br>Just click on the button next to a Tweet in your history to regenerate its tracemap.',
            selectors: [
                '.acc-source',
                '.acc-influential',
                '.acc-metrics',
                '.acc-enhanced-metrics',
                '.acc-last-tracemaps'
            ],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-last-tracemaps',
                post_value: undefined
            }
        }, {
            head: 'User Details',
            text: 'If you click on a user node in the network graph, you can see this users details.<br><br>' +
                '<span>Now, click on a user.</span>',
            selectors: ['tool'],
            styles: {
                top: '100px',
                left: '100px'
            },
            service_action: 'openUserInfo',
        }, {
            head: 'User Info',
            text: 'Here you can see general information about a user, including its profile text and some metrics.',
            selectors: ['tool'],
            styles: {
                top: '50px',
                left: '400px'
            },
            service_action: undefined
        }, {
            head: 'User Timeline',
            text: 'You can generate new tracemaps from all the tweets on a users timeline.',
            selectors: ['tool'],
            styles: {
                top: '400px',
                left: '400px'
            },
            service_action: undefined
        }, {
            head: 'User Info',
            text: 'Resort or filter the tweets shown with these settings.',
            selectors: ['tool'],
            styles: {
                top: '50px',
                left: '550px'
            },
            service_action: {
                subject: 'userSettingsOpen',
                pre_value: true,
                post_value: false
            }
        }
    ];

    constructor(
        private tourService: TourService,
        private graphService: GraphService
    ) {
    }

    openIntro() {
        this.introOpen = true;
    }

    closeIntro() {
        this.introOpen = false;
    }

    startTour() {
        this.introOpen = false;
        this.activeItem = 0;
        this.tourOpen = true;
        this.preAction();

        this.activeNodeSubscription = this.graphService.activeNode.subscribe( userId => {
            if (userId && !this.userDetailsOpen) {
                // close userDetails after user opens it at the general
                // section of the tutorial
                this.graphService.activeNode.next(undefined);
            } else if (!userId && this.userDetailsOpen) {
                // open userDetails after user closes it at the user
                // details section of the tutorial
                this.graphService.activeNode.next(this.chosenUserId);
            } else if (userId && this.userDetailsOpen) {
                // set last user id as general one to return to
                // after user closes it
                if (!this.chosenUserId) {
                    this.nextItem();
                    setTimeout( () => {
                        this.preAction();
                    }, 500);
                }
                this.chosenUserId = userId;
            }
        });
    }

    closeTour() {
        this.tourOpen = false;
        this.chosenUserId = undefined;
        this.userDetailsOpen = false;
        if (this.activeNodeSubscription) {
            this.activeNodeSubscription.unsubscribe();
        }
        this.postAction();
    }

    postAction() {
        this.data[this.activeItem].selectors.forEach( selector => {
            if (selector === 'tool') {
                this.tourOverlayHidden = false;
            }
            $(selector).removeClass('tour-highlight');
        });
        const serviceAction = this.data[this.activeItem].service_action;
        if (serviceAction && serviceAction !== 'openUserInfo') {
            const subject = serviceAction.subject;
            const post = serviceAction.post_value;
            this.tourService[subject].next(post);
        }
    }

    preAction() {
        this.data[this.activeItem].selectors.forEach( selector => {
            if (selector === 'tool') {
                this.tourOverlayHidden = true;
            }
            $(selector).addClass('tour-highlight');
        });

        const serviceAction = this.data[this.activeItem].service_action;
        if (serviceAction === 'openUserInfo') {
            this.userDetailsOpen = true;
        } else if (serviceAction) {
            const subject = serviceAction.subject;
            const pre = serviceAction.pre_value;
            this.tourService[subject].next(pre);
        }
    }

    lastItem() {
        this.postAction();
        this.activeItem--;
        this.preAction();
    }

    nextItem() {
        this.postAction();
        this.activeItem++;
        this.preAction();
    }
}

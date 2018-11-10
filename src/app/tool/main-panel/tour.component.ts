import { Component } from '@angular/core';

import { TourService } from './../services/tour.service';
import { GraphService } from './../services/graph.service';
import { CommunicationService } from './../services/communication.service';

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
            head: 'The TraceMap',
            text: 'You can see how the tweet reached each retweeter by looking at the connections between them.<br>' +
            'Bigger nodes indicate more influential users.<br><br>' +
            'By hovering a user\'s node, the incoming connections (friends) and outgoing connections (followers) are highlighted.',
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
            text: 'Use this slider to see the network at any point in time between its creation and the present.',
            selectors: ['.timeslider', '.graph'],
            styles: {
                bottom: '90px',
                left: '50%'
            },
            service_action: undefined
        }, {
            head: 'Graph Settings',
            text: 'In the settings you can change the appearance of the network or the behaviour of the dragged nodes.',
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
            text: 'This is the source tweet whose tracemap is being shown. Under it, you can see how many retweets it has so far.',
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
            text: 'Here we show a list of users sorted by degree of influence within this tracemap.<br>' +
            'That is, how much each user has contributed to spreading this tweet.',
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
            text: 'These are some relevant metrics calculated from Twitter\'s data that might be useful to you.',
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
            text: 'With the first chart you can see how the number of retweets changed over time.<br>' +
            'Moving the time slider also instantaneously affects this chart.',
            selectors: [
                '.acc-source',
                '.acc-influential',
                '.acc-metrics',
                '.acc-enhanced-metrics',
                '.timeslider'
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
            head: 'Charts',
            // tslint:disable-next-line:max-line-length
            text: 'With the following charts, you can also cross compare how many followers each user has and how many tweets they have authored.',
            selectors: [
                '.acc-source',
                '.acc-influential',
                '.acc-metrics',
                '.acc-enhanced-metrics'
            ],
            styles: {
                bottom: '100px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-enhanced-metrics',
                post_value: undefined
            }
        }, {
            head: 'Last TraceMaps',
            // tslint:disable-next-line:max-line-length
            text: 'Do you want to go back to your previous tracemaps? Just click on the "show tracemap" button inside this menu and it will be generated again.',
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
            text: 'If you click on a node in the tracemap, you can see the corresponding user\'s details.<br><br>' +
            'Try it now!',
            selectors: ['tool'],
            styles: {
                top: '100px',
                left: '100px'
            },
            service_action: 'openUserInfo',
        }, {
            head: 'User Info',
            text: 'Here you can see general information about the user you clicked, including their profile and timeline.',
            selectors: ['tool'],
            styles: {
                top: '50px',
                left: '400px'
            },
            service_action: undefined
        }, {
            head: 'Semantic Cloud',
            text: 'The Semantic Cloud displays the words, hashtags and handles used most frequently in the last 200 tweets' +
            ' & retweets of this user.<br> Click on a word to display the according tweets, click the free space around the words' +
            ' to reset your selection.',
            selectors: ['tool'],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: undefined
        }, {
            head: 'Cloud Settings',
            text: 'In the cloud settings you can choose which content is shown in the cloud.',
            selectors: ['tool'],
            styles: {
                top: '200px',
                left: '600px'
            },
            service_action: {
                subject: 'cloudSettingsOpen',
                pre_value: true,
                post_value: false
            }
        }, {
            head: 'User Timeline',
            text: 'You can also generate new tracemaps from any of the tweets in their timeline.',
            selectors: ['tool'],
            styles: {
                bottom: '100px',
                left: '400px'
            },
            service_action: undefined
        }, {
            head: 'User Settings',
            text: 'Resort the timeline by number of retweets to see the most viral on top.<br>' +
            'The checkbox controls if only self-authored tweets are shown or if retweets are also included.',
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
        private graphService: GraphService,
        private communicationService: CommunicationService
    ) {
        this.communicationService.firstTimeVisitor.subscribe( firstTime => {
            if (firstTime) {
                this.openIntro();
            }
        });
    }

    keyListener = (event) => {
        const key = event.key;
        if (key === 'ArrowRight' || key === 'Enter') {
            if (this.activeItem['service_action'] !== 'openUserInfo') {
                this.nextItem();
            }
        } else if (key === 'ArrowLeft') {
            this.lastItem();
        } else if (key === 'Escape') {
            this.closeTour();
        }
    }

    addKeyListener(): void {
        document.addEventListener( 'keydown', this.keyListener);
    }

    removeKeyListener(): void {
        document.removeEventListener( 'keydown', this.keyListener);
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
        this.addKeyListener();

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
        this.removeKeyListener();
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
            const subject = serviceAction['subject'];
            const post = serviceAction['post_value'];
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
            const subject = serviceAction['subject'];
            const pre = serviceAction['pre_value'];
            this.tourService[subject].next(pre);
        }
    }

    lastItem() {
        if (this.activeItem !== 0) {
            this.postAction();
            this.activeItem--;
            this.preAction();
        }
    }

    nextItem() {
        if (this.activeItem !== this.data.length - 1 ) {
                // this.data[this.activeItem]['service_action'] !== 'openUserInfo') {
            this.postAction();
            this.activeItem++;
            this.preAction();
        }
    }
}

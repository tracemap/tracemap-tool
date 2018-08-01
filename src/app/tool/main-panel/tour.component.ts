import { Component } from '@angular/core';

import { TourService } from './../services/tour.service';

import * as $ from 'jquery';

@Component({
    selector: 'tour',
    templateUrl: './tour.component.html',
    styleUrls: ['./../multi-use/tooltip.scss', './tour.component.scss']
})

export class TourComponent {
    introOpen = false;
    tourOpen = false;

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
            service_action: undefined
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
            selectors: ['.acc-influential'],
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
            selectors: ['.acc-metrics'],
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
            selectors: ['.acc-enhanced-metrics'],
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
            selectors: ['.acc-last-tracemaps'],
            styles: {
                top: '200px',
                left: '400px'
            },
            service_action: {
                subject: 'openAccordeon',
                pre_value: 'acc-last-tracemaps',
                post_value: undefined
            }
        }
    ];

    constructor(
        private tourService: TourService
    ) {}

    openIntro() {
        this.introOpen = true;
    }

    closeIntro() {
        this.introOpen = false;
    }

    startTour() {
        this.introOpen = false;
        this.tourOpen = true;
        this.activeItem = 0;
        this.preAction();
    }

    closeTour() {
        this.tourOpen = false;
    }

    postAction() {
        this.data[this.activeItem].selectors.forEach( selector => {
            $(selector).removeClass('tour-highlight');
        });
        const serviceAction = this.data[this.activeItem].service_action;
        if (serviceAction) {
            const subject = serviceAction.subject;
            const post = serviceAction.post_value;
            this.tourService[subject].next(post);
        }
    }

    preAction() {
        this.data[this.activeItem].selectors.forEach( selector => {
            $(selector).addClass('tour-highlight');
        });
        const serviceAction = this.data[this.activeItem].service_action;
        if (serviceAction) {
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

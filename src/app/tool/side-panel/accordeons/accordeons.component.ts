import { Component } from '@angular/core';

import { TourService } from './../../services/tour.service';

@Component({
    selector: 'accordeons',
    templateUrl: './accordeons.component.html',
    styleUrls: ['./accordeons.component.scss']
})

export class AccordeonsComponent {
    accordeons = [
        {
            name: 'Source Tweet',
            selector: 'acc-source',
            open: true,
            rendered: false
        }, {
            name: 'Most Influential Users',
            selector: 'acc-influential',
            open: false,
            rendered: false
        }, {
            name: 'Metrics',
            selector: 'acc-metrics',
            open: true,
            rendered: false
        }, {
            name: 'Charts',
            selector: 'acc-enhanced-metrics',
            open: false,
            rendered: false
        }, {
            name: 'Last TraceMaps',
            selector: 'acc-last-tracemaps',
            open: false,
            rendered: false
        }
    ];

    constructor(
        private tourService: TourService
    ) {
        this.tourService.openAccordeon.subscribe( selector => {
            if (selector) {
                this.closeAll();
                this.openBySelector(selector);
            }
        });
    }

    toggle(accordeon) {
        if ( accordeon.open) {
            accordeon.open = false;
        } else {
            accordeon.open = true;
        }
    }

    closeAll() {
        this.accordeons.forEach( accordeon => {
            accordeon.open = false;
        });
    }

    openBySelector(selector: string): void {
        this.accordeons.filter( accordeon => accordeon.selector === selector)[0].open = true;
    }

    toggleRendered(rendered, element) {
        element.rendered = rendered;
    }
}

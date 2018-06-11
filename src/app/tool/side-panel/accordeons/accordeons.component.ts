import { Component } from '@angular/core';

@Component({
    selector: 'accordeons',
    templateUrl: './accordeons.component.html',
    styleUrls: ['./accordeons.component.scss']
})

export class AccordeonsComponent {
    accordeons = [
        {
            name: "Source Tweet",
            selector: "acc-source",
            open: false,
            rendered: false
        },{
            name: "Most Influential Users",
            selector: "acc-influential",
            open: false,
            rendered: false
        },{
            name: "Metrics",
            selector: "acc-metrics",
            open: false,
            rendered: false
        },{
            name: "Enhanced Metrics",
            selector: "acc-enhanced-metrics",
            open: true,
            rendered: false
        },{
            name: "Last TraceMaps",
            selector: "AccHistoryComponent",
            open: false,
            rendered: false
        }
    ];

    toggle(accordeon) {
        if( accordeon.open) {
            accordeon.open = false;
        } else {
            accordeon.open = true;
        }
    }

    toggleRendered(rendered, element) {
        element.rendered = rendered;
    }
}

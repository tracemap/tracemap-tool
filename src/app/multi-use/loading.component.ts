import { Component, Input, OnChanges, AfterViewInit, ViewChild } from '@angular/core';

import * as d3 from 'd3';

@Component({
    selector: 'loader',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements OnChanges, AfterViewInit {
    @Input('isLoaded')
    loaded: boolean;
    @ViewChild('loading_canvas') canvas;
    colorFade: any;
    elements: any[];

    ngAfterViewInit() {
        let svg = d3.select(".loading-animation");
        let radias = [30,20,10];
        this.elements = [];
        radias.forEach( radius => {
            let circle = svg.append("circle")
               .attr("class", "circle")
               .attr("cx",100)
               .attr("cy",100)
               .attr("r", radius)
               .style("fill","#fff")
               .style("transition", "fill .6s ease-in-out")
               .attr("stroke","#9729ff")
               .attr("stroke-width", 3.5)
            this.elements.push(circle);
        });
        let index = 0;
    }

    ngOnChanges() {
        if( this.loaded == true) {
            this.canvas.nativeElement.classList.add('loaded');
            window.clearInterval(this.colorFade)
        } else if( this.loaded == false) {
            this.canvas.nativeElement.classList.remove('loaded');
            let index = 0;
            this.colorFade = window.setInterval( () => {
                if( this.elements) {
                    let element = this.elements[(index + 1) % this.elements.length];
                    let oldElement = this.elements[ index];
                    element.style("fill","#9729ff");
                    oldElement.style("fill","#fff");
                    index = (index + 1) % this.elements.length;
                }
            }, 600);
        }
    }
}

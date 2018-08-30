import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss']
})

export class OverlayComponent {
    @Input()
    text: string;
    @Output('close')
    close = new EventEmitter<boolean>(false);

    closeOverlay(): void {
        this.close.next(true);
    }
}

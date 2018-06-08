import { Pipe, PipeTransform } from '@angular/core';
/*
 * Transform a unix timestamp
 * to a combination of a value
 * and a corresponding unit
 * with a given maximum value
 * before switching to the next
 * higher unit.
*/
@Pipe({name: 'timeLabel'})
export class TimeLabelPipe implements PipeTransform {
    transform( inValue: number, maximum: number): string {
        let unit = "s";
        let value = inValue;
        if( value > maximum) {
            unit = "m";
            value = value / 60;
            if( value > maximum) {
                unit = "h";
                value = value / 60;
            }
        }
        return value.toFixed(1) + unit;
    }
}

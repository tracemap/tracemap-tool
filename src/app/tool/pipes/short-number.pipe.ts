import { Pipe, PipeTransform } from '@angular/core';
/*
 * Shorten a Number to a String with
 * 3 digits and + unit
 * (K for thousands, M for millions)
*/
@Pipe({name: 'shortNumber'})
export class ShortNumberPipe implements PipeTransform {
    transform( inValue: number): string {
        const k = 1000;
        const mil = k * 1000;
         if (inValue >= mil) {
            const milValue = inValue / mil;
            return milValue.toFixed(1) + 'mil';
         } else if (inValue >= k ) {
            const kValue = inValue / k;
            return kValue.toFixed(1) + 'k';
        } else {
            return inValue.toString();
        }
    }
}

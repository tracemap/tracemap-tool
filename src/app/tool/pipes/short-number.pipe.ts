import { Pipe, PipeTransform } from '@angular/core';
/*
 * Shorten a Number to a String with
 * 3 digits and + unit 
 * (K for thousands, M for millions)
*/
@Pipe({name: 'shortNumber'})
export class ShortNumberPipe implements PipeTransform {
    transform( inValue: number): string {
        if( inValue < 10000) {
            return inValue + "";
        } else {
            let kValue = inValue / 1000;
            if( kValue < 10) {
                return kValue.toFixed(1) + "K";
            } else if( kValue < 1000) {
                return Math.floor(kValue) + "K";
            } else {
                let mValue = kValue / 1000;
                if( mValue < 10) {
                    return mValue.toFixed(1) + "M";
                } else {
                    return Math.floor(mValue) + "M"
                }
            }
        }
    }
}

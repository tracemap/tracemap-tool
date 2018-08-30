import { Pipe, PipeTransform } from '@angular/core';
/*
 * Transform a unix timestamp
 * to the corresponding amount
 * of years with a given decimal
 * place.
*/
@Pipe({name: 'toYear'})
export class ToYearPipe implements PipeTransform {
    transform( inValue: number, decimal: number): string {
        let value = inValue;
        let years = (value / (1000 * 60 * 60 * 24 * 365)).toFixed(decimal);
        return years;
    }
}

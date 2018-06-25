import { Pipe, PipeTransform } from '@angular/core';
/*
 * Takes a string and returns html code
 * containing links to websites,
 * twitter accounts and hashtags
*/
@Pipe({name: 'linkedString'})
export class LinkedStringPipe implements PipeTransform {
    transform( text: string): string {
        let html = "";
        let words = text.split(' ');
        words = words.map( word => {
            if( word.indexOf("https://") == 0) {
                return "<a href='" + word + "'>"+word+"</a>";
            } else if( word.indexOf("@") == 0) {
                let accountName = word.slice(1);
                return "<a href=\"https://twitter.com/"+accountName+"\">"+word+"</a>";
            } else if( word.indexOf("#") == 0) {
                let hashtag = word.slice(1);
                return "<a href=\"https://twitter.com/hashtag/"+hashtag+"\">"+word+"</a>";
            } else {
                return word;
            }
        })
        console.log(words);
        html = words.join(' ');
        return html;
    }
}

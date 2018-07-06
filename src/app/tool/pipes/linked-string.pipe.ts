import { Pipe, PipeTransform } from '@angular/core';
/*
 * Takes a string and returns html code
 * containing links to websites,
 * twitter accounts and hashtags
*/
@Pipe({name: 'linkedString'})
export class LinkedStringPipe implements PipeTransform {
    transform( text: string): string {
        text = text.replace(/https:\S*/g, (link) => {
            return '<a target=\'_blank\' href=\'' + link + '\'>' + link + '</a>';
        });
        text = text.replace(/#\w*/g, (hashtag) => {
            return '<a target=\'_blank\' href=\'https://twitter.com/hashtag/' + hashtag.slice(1) + '?src=hash\'>' + hashtag + '</a>';
        });
        text = text.replace(/@\w*/g, (user) => {
            return '<a target=\'_blank\' href=\'https://twitter.com/' + user.slice(1) + '\'>' + user + '</a>';
        });
        return text;
    }
}

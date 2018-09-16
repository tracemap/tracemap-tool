import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { WordcloudService } from '../../services/wordcloud.service';

import * as wc from '../../../../assets/javascript/wordcloud2.js';

@Component({
    selector: 'app-wordcloud',
    templateUrl: './wordcloud.component.html',
    styleUrls: ['./wordcloud.component.scss']
})

export class WordcloudComponent {

    constructor(
        private wordcloudService: WordcloudService,
        private http: Http
    ) {
        this.wordcloudService.timelineTexts.subscribe( texts => {
            if (texts) {
                console.log(texts.length);
                console.log(texts);
                this.createWordList(texts);
            }
        });
    }

    createWordList(texts: string[]) {
        const wordDict = {};
        texts.forEach(text => {
            const textwords = text.replace(/[^#@ßüäöÜÄÖ \w\n]/g, '').split(/[\s+]/g);
            textwords.forEach( word => {
                if (word.length > 2) {
                    wordDict[word] ? wordDict[word]++ : wordDict[word] = 1;
                }
            });
        });
        this.getStopwordLists().then( stopwords => {
            let wordList = [];
            Object.keys(wordDict).forEach( key => {
                if (stopwords.indexOf(key.toLowerCase()) === -1) {
                    wordList.push([key, wordDict[key]]);
                }
            });
            wordList = wordList.sort( (a, b) => b[1] - a[1]).splice(0, 30);
            this.initCloud(wordList);
        });
    }

    getStopwordLists(): Promise<string[]> {
        return new Promise( (res) => {
            const english = this.http.get('assets/stopwords/english.txt').toPromise();
            const german = this.http.get('assets/stopwords/german.txt').toPromise();
            Promise.all([english, german]).then( results => {
                let fullList = [];
                results.forEach( result => {
                    fullList = fullList.concat(result.text().split(/\s+/g));
                });
                res(fullList);
            });
        });
    }

    initCloud(wordList) {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.querySelector('.wordcloud-canvas');
        canvas['width'] = 290 * dpr;
        canvas['height'] = 290 * dpr;
        wc(document.querySelector('.wordcloud-canvas'), {
            list: wordList,
            backgroundColor: '#fff',
            fontFamily: 'IBM Plex',
            weightFactor: (size) => Math.sqrt(size * 50) * dpr,
            drawOutOfBound: false,
            shuffle: true,
        });
    }
}

import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { WordcloudService } from '../../services/wordcloud.service';

import * as wc from '../../../../assets/javascript/wordcloud2.js';
import { TouchSequence } from 'selenium-webdriver';

@Component({
    selector: 'app-wordcloud',
    templateUrl: './wordcloud.component.html',
    styleUrls: ['./wordcloud.component.scss']
})

export class WordcloudComponent {

    hovered = false;
    wordList;
    colors = {
        handles: 'rgba(98, 101, 112,', // light purple for words
        words: 'rgba(141, 41, 255,', // purple for words
        hashtags: 'rgba(36, 41, 51,', // blackish for hashtags
        noopac: ' 1)',
        opac: ' 0.2)',
    };

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
            const wordList = [];
            Object.keys(wordDict).forEach( key => {
                if (stopwords.indexOf(key.toLowerCase()) === -1) {
                    wordList.push([key, wordDict[key]]);
                }
            });
            this.wordList = wordList.sort( (a, b) => b[1] - a[1]).splice(0, 30);
            this.initCloud();
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

    initCloud(hover?: string): Promise<void> {
        return new Promise( (res) => {
            const dpr = window.devicePixelRatio || 1;
            const canvas = document.querySelector('.wordcloud-canvas');
            canvas['width'] = 290 * dpr;
            canvas['height'] = 290 * dpr;
            wc(document.querySelector('.wordcloud-canvas'), {
                list: this.wordList,
                backgroundColor: '#fff',
                color: (word) => {
                    if (!hover || word === hover) {
                        if (word.indexOf('#') === 0) {
                            return this.colors.hashtags + this.colors.noopac;
                        } else if (word.indexOf('@') === 0) {
                            return this.colors.handles + this.colors.noopac;
                        } else {
                            return this.colors.words + this.colors.noopac;
                        }
                    } else {
                        if (word.indexOf('#') === 0) {
                            return this.colors.hashtags + this.colors.opac;
                        } else if (word.indexOf('@') === 0) {
                            return this.colors.handles + this.colors.opac;
                        } else {
                            return this.colors.words + this.colors.opac;
                        }
                    }
                },
                fontFamily: 'IBM Plex',
                weightFactor: (size) => Math.sqrt(size * 50) * dpr,
                drawOutOfBound: false,
                shuffle: false,
                rotateRatio: 0,
                click: (item) => {this.highlightWord(item); },
                hover: (item) => {this.changePointer(item); }
            });
            res();
        });
    }

    highlightWord(item) {
        const word = item[0];
        this.wordcloudService.selectedWord.next(word);
        this.initCloud(word);
    }

    unhighlight() {
        if (!this.hovered) {
            this.wordcloudService.selectedWord.next(undefined);
            this.initCloud();
        }
    }

    changePointer(item) {
        if (item) {
            this.hovered = true;
        } else {
            this.hovered = false;
        }
    }
}

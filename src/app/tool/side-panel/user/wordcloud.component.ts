import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { WordcloudService } from '../../services/wordcloud.service';

import * as wc from '../../../../assets/javascript/wordcloud2.js';
import { CommunicationService } from '../../services/communication.service';

@Component({
    selector: 'app-wordcloud',
    templateUrl: './wordcloud.component.html',
    styleUrls: ['./wordcloud.component.scss']
})

export class WordcloudComponent {

    hovered = false;
    wordList;
    filteredWordlist;
    canvas;
    weightFactor;
    settings = {
        words: true,
        handles: true,
        hashtags: true
    };
    colors = {
        handles: 'rgba(98, 101, 112,', // light purple for words
        words: 'rgba(141, 41, 255,', // purple for words
        hashtags: 'rgba(36, 41, 51,', // blackish for hashtags
        noopac: ' 1)',
        opac: ' 0.2)',
    };

    constructor(
        private wordcloudService: WordcloudService,
        private communicationService: CommunicationService,
        private http: Http,
    ) {
        this.wordcloudService.timelineTexts.subscribe( texts => {
            if (texts) {
                if (this.canvas) {
                    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
                this.createWordList(texts);
            }
        });
    }

    createWordList(texts: string[]) {
        this.canvas = undefined;
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
            this.wordList = wordList.sort( (a, b) => b[1] - a[1]);
            this.filterWordlist();
            this.communicationService.wordcloudSettings.subscribe( settings => {
                if (settings) {
                    Object.keys(settings).forEach( key => {
                        this.settings[key] = settings[key];
                    });
                    this.filterWordlist();
                }
            });
        });
    }

    filterWordlist() {
        this.filteredWordlist = undefined;
        this.filteredWordlist = this.wordList.filter( tupel => {
            const word = tupel[0];
            if (this.settings.hashtags && word.indexOf('#') === 0) {
                return tupel;
            }
            if (this.settings.handles && word.indexOf('@') === 0) {
                return tupel;
            }
            if (this.settings.words && word.indexOf('#') !== 0 && word.indexOf('@') !== 0) {
                return tupel;
            }
        });
        if (this.filteredWordlist.length > 0) {
            this.filteredWordlist = this.filteredWordlist.splice(0, 30);
            this.weightFactor =  1000 / this.filteredWordlist[0][1];
            this.initCloud();
        } else {
            if (this.canvas) {
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    getStopwordLists(): Promise<string[]> {
        return new Promise( (res) => {
            const english = this.http.get('assets/stopwords/english.txt').toPromise();
            const german = this.http.get('assets/stopwords/german.txt').toPromise();
            const custom = this.http.get('assets/stopwords/custom.txt').toPromise();
            Promise.all([english, german, custom]).then( results => {
                let fullList = [];
                results.forEach( result => {
                    fullList = fullList.concat(result.text().split(/\s+/g));
                });
                res(fullList);
            });
        });
    }

    initCloud(hover?: string): Promise<void> {
        console.log('init cloud');
        return new Promise( (res) => {
            const dpr = window.devicePixelRatio || 1;
            this.canvas = document.querySelector('.wordcloud-canvas');
            this.canvas['width'] = 328 * dpr;
            this.canvas['height'] = 250 * dpr;
            wc(this.canvas, {
                list: this.filteredWordlist,
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
                fontFamily: 'IBM Plex Sans',
                weightFactor: (size) => (Math.sqrt((size) * this.weightFactor) + 2) * dpr,
                drawOutOfBound: false,
                shuffle: false,
                rotateRatio: 0,
                click: (item) => {this.highlightWord(item); },
                hover: (item) => {this.changeCursor(item); }
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

    changeCursor(item) {
        if (item) {
            this.hovered = true;
        } else {
            this.hovered = false;
        }
    }
}

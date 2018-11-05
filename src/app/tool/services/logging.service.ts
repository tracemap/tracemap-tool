import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
@Injectable( )

export class LoggingService {

    tracemapLog: object;
    progressBarLog: object;

    constructor(
        private apiService: ApiService
    ) {}

    startTracemapGeneration(tweetId: string) {
        const timeString = Math.floor(Date.now() / 1000).toString();
        this.tracemapLog = {
            time_str: timeString,
            tweet_id_str: tweetId,
            count: 1
        };
    }

    finishTracemapGeneration(retweetCount: number) {
        const loadingTimeSec = Math.floor(Date.now() / 1000) - this.tracemapLog['time_str'];
        this.tracemapLog['retweet_count'] = retweetCount;
        this.tracemapLog['loading_time_sec'] = loadingTimeSec;
        this.apiService.loggingWriteLog( 'tracemaps-generated', this.tracemapLog).subscribe( reponse => {});
    }
}

/*import {ShellEntry} from "../ShellEntry";
const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
import {getEntry} from "./utils/getEntry";
import * as log from './log';
import {mkdir} from "./mkdir";

export const download = (url : string, dest : string) : Promise<ShellEntry> => {
    return new Promise((resolve, reject) => {
        fetch(url).then((res) => {
            // dest could be deep folder
            let parent = path.dirname(dest);
            mkdir(parent).then(() => {
                const writeStream = fs.createWriteStream(dest);
                res.body.pipe(writeStream);
                getEntry(dest).then(entry => {
                    log.info("file downloaded");
                    resolve(entry);
                }, reject);
            }, reject);
        }, reject);
    });
}*/


import {ShellEntry} from "../ShellEntry";
const fs = require('fs');
const path = require('path');
import {getEntry} from "./utils/getEntry";
import * as log from './log';
import {mkdir} from "./mkdir";

export const download = (url : string, dest : string, progressCallback? : (progress: any) => void) : Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
      let parent = path.dirname(dest);
      mkdir(parent).then(() => {
          launchDownloadStreamXHR(url, dest, progressCallback).then((file) => {
              resolve(file);
          }).catch((err) => {
              reject(err);
          });
      }, reject);
  });
};

const launchDownloadStreamXHR = (url : string, dest : string, progressCallback? : (progress: any) => void) :Promise<ShellEntry> => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let fileStream = fs.createWriteStream(dest);
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onerror = (err) => {
            reject(err);
        };
        if(typeof progressCallback === 'function'){
            xhr.onprogress = (e) => {
                if(e.lengthComputable){
                    progressCallback({
                        action: 'downloading',
                        loaded: e.loaded,
                        total: e.total,
                        percentDownloading: (e.loaded > 0) ? ((e.loaded / e.total) * 100) : 0,
                        percent: (e.loaded > 0) ? ((e.loaded / e.total) * 50) : 0,
                    });
                }
            };
        }
        xhr.onload = function() {
            if (this.status == 200) {
                progressCallback({
                    action: 'downloading',
                    loaded: this.response.byteLength,
                    total: this.response.byteLength,
                    percentDownloading: 100,
                    percent: 50,
                });
                fileStream.write(Buffer.from(this.response));
                fileStream.end(() => {
                    getEntry(dest).then(entry => {
                        log.info("file downloaded");
                        if(typeof progressCallback === 'function'){
                            progressCallback({
                                action: 'writing',
                                written: entry.size,
                                total: entry.size,
                                percentWriting: 100,
                                percent: 100,
                            });
                            resolve(entry);
                        }
                    }, reject);
                });
            }
        };
        xhr.send();
    });
};

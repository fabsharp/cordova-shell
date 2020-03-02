import {extractFileName} from "./utils/extractFileName";
import {mkdir} from "./mkdir";
import * as log from "./log/index";
import {ShellEntry} from "../ShellEntry";

export const download = (url : string, dest : string, progressCallback? : (progress: any) => void) : Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    let extract = extractFileName(dest);
    let newName = extract.file;
    let directory = extract.directory;
    mkdir(directory).then((directoryEntry) => {
      directoryEntry.nativeEntry.getFile(newName, {create : true, exclusive : false}, (entry : FileEntry) => {
        launchDownloadStreamXHR(url, entry, progressCallback).then((file) => {
          resolve(file);
        }).catch((err) => {
          reject(err);
        });
      }, error => {
        log.fileError(error);
        reject(error);
      });
    }, reject)
  });
};

const launchDownloadStreamXHR = (url : string, entry : FileEntry, progressCallback? : (progress: any) => void) :Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
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
          loaded: this.response.size,
          total: this.response.size,
          percentDownloading: 100,
          percent: 50,
        });
        let blob = new Blob([this.response], {type: 'application/octet-binary'});
        writeFile(entry, blob, progressCallback).then((file) => {
          resolve(file);
        }).catch((err) => {
          reject(err);
        });
      }
    };
    xhr.send();
  });
};

const writeFile = (entry : FileEntry, data : Blob, progressCallback? : (progress: any) => void) :Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    entry.createWriter((fileWriter : FileWriter) => {
      fileWriter.onerror = (err) => {
        log.info(`Failed file write: ${err.toString()}`);
        reject(err);
      };
      function writeFinish() {
        function success() {
          progressCallback({
            action: 'writing',
            written: data.size,
            total: data.size,
            percentWriting: 100,
            percent: 100,
          });
          ShellEntry.fromCordova(entry).then(shellEntry => {
            resolve(shellEntry);
          });
        }
        function fail(error) {
          log.info(`Unable to retrieve file properties: ${error.code}`);
          reject(error);
        }
        entry.file(success, fail);
      }
      let written = 0;
      let BLOCK_SIZE = 1 * 1024 * 1024; // write 1M every time of write
      function writeNext(cbFinish) {
        fileWriter.onwrite = () => {
          if (written < data.size) {
            writeNext(cbFinish);
          } else {
            cbFinish();
          }
        };
        if (written) {
          fileWriter.seek(fileWriter.length);
        }
        if(typeof progressCallback === 'function'){
          progressCallback({
            action: 'writing',
            written: written,
            total: data.size,
            percentWriting: ((written/ data.size) * 100) || 0,
            percent: 50 + ((written/ data.size) * 50),
          });
        }
        fileWriter.write(data.slice(written, written + Math.min(BLOCK_SIZE, data.size - written)));
        written += Math.min(BLOCK_SIZE, data.size - written);
      }
      writeNext(writeFinish);
    });
  });
};

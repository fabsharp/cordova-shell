import * as log from "./log/index";
import {extractFileName} from "./utils/extractFileName";
import {mkdir} from "./mkdir";
import {ls} from "./ls";

function _copy(source : string, dest : string, progressCallback? : (percent) => void ) : Promise<Entry> {
  // TODO : progressCallback
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(source, entry => {
      if(entry.isFile) {
        let extract = extractFileName(dest);
        let newName = extract.file;
        let directory = extract.directory;
        window.resolveLocalFileSystemURL(directory, (parentDirectory) => {
          let _parent = <DirectoryEntry> parentDirectory;
          entry.copyTo(_parent, newName, item => {
            log.info(entry.name + ' copied.');
            resolve(item);
          }, (err) => {
            log.fileError(err);
            reject(err);
          });
        }, (err) => {
          log.fileError(err);
          reject(err);
        });
      }
      else {
        // entry is a directory
        mkdir(dest).then((destDirectory) => {
          ls(source).then((entries) => {
            let promises = [];
            entries.forEach((entry) => {
              promises.push(_copy(source + '/' + entry.name, dest + '/' + entry.name));
            });
            Promise.all(promises).then(() => {
              log.info(source + ' copied.');
              resolve(destDirectory);
            });
          }, reject);
        }, reject)
      }
    }, (err) => {
      log.fileError(err);
      reject(err);
    });
  });
}

export const copy = _copy;
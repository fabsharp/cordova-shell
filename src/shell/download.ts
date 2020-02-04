import {extractFileName} from "./utils/extractFileName";
import {mkdir} from "./mkdir";
import * as log from "./log/index";

export const download = (url : string, dest : string) : Promise<FileEntry> => {
  return fetch(url).then((response : Response) => {
    if(response.ok) {
      return response.blob()
    }
    else {
      return Promise.reject(response);
    }
  }).then((blob : Blob) => {
    let extract = extractFileName(dest);
    let newName = extract.file;
    let directory = extract.directory;
    return new Promise((resolve, reject) => {
      mkdir(directory).then((directoryEntry) => {
        directoryEntry.getFile(newName, {create : true, exclusive : false}, (entry : FileEntry) => {
          entry.createWriter((writer : FileWriter) => {
            writer.onwriteend = function() {
              log.info('file downloaded.');
              resolve(entry);
            };
            writer.onerror = function(e) {
              reject(e);
            };
            writer.write(blob);
          });
        }, error => {
          log.fileError(error);
          reject(error);
        })
      }, reject)
    });
  }, (err) => Promise.reject(err))
};
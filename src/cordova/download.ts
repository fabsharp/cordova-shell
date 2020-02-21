import {extractFileName} from "./utils/extractFileName";
import {mkdir} from "./mkdir";
import * as log from "./log/index";
import {ShellEntry} from "../ShellEntry";

export const download = (url : string, dest : string) : Promise<ShellEntry> => {
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
        directoryEntry.nativeEntry.getFile(newName, {create : true, exclusive : false}, (entry : FileEntry) => {
          entry.createWriter((writer : FileWriter) => {
            writer.onwriteend = function() {
              log.info('file downloaded.');
              ShellEntry.fromCordova(entry).then(shellEntry => {
                resolve(shellEntry);
              });
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
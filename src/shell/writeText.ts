import {getEntry} from "./utils/getEntry";
import {extractFileName} from "./utils/extractFileName";
import * as log from './log/index';

export const writeText = (text : string, url : string) : Promise<FileEntry> => {
  return new Promise((resolve, reject) => {
    let extract = extractFileName(url);
    let fileName = extract.file;
    let directory = extract.directory;
    getEntry(directory).then((directory : DirectoryEntry) => {
      directory.getFile(fileName, {create : true, exclusive : false}, (file) => {
        let writer = file.createWriter(fileWriter => {
          fileWriter.onwriteend = function() {
            log.info('file wrote.')
            resolve(file);
          };
          fileWriter.onerror = Promise.reject;
          fileWriter.write(text);
        }, Promise.reject);
      }, Promise.reject);
    })
  });
}
import * as log from "./log/index";
import {ShellEntry} from "../ShellEntry";

export const ls = (path : string) : Promise<ShellEntry[]> => {
  // if it's a directory it sould end with a slash
  // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/1203361#1203361
  let extension = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
  if(extension === path) {
    // it's a directory
    if(!path.endsWith('/')) {
      path += '/';
    }
  }
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(path, (entry) => {
      if(entry.isFile) {
        log.info('file found : ' + entry.name);
        ShellEntry.fromCordova(entry).then(shellEntry => {
          resolve([shellEntry]);
        });
      }
      else {
        let dir = <DirectoryEntry> entry;
        let reader = dir.createReader();
        reader.readEntries(entries => {
          log.entry(entries);
          let promises = [];
          entries.forEach(entry => {
            promises.push(ShellEntry.fromCordova(entry))
          });
          Promise.all(promises).then(shellEntries => {
            resolve(shellEntries);
          })
        },(err) => {
          log.fileError(err);
          reject(err);
        })
      }
    }, (err) => {
      log.fileError(err);
      reject(err);
    })
  });
};

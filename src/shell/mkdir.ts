import {getEntry} from "./utils/getEntry";
import * as log from "./log/index";

function _mkdir (path : string) : Promise<DirectoryEntry> {
  let split = path.split('/');
  let dir = split.pop();
  // case 1) cdvfile://localhost/persistent/updatable/
  // case 2) cdvfile://localhost/persistent/updatable
  // In case 1 last split member is '';
  if(dir === '') {
    dir = split.pop();
  }
  let parent = split.join('/') + '/';
  return new Promise((resolve, reject) => {
    getEntry(parent).then((parentDirectory : DirectoryEntry) => {
      parentDirectory.getDirectory(dir, { create : true, exclusive : false}, (directory : DirectoryEntry) => {
        log.info('directory created.')
        resolve(directory);
      }, (err) => {
        log.fileError(err);
        reject(err);
      });
    }, () => {
      return _mkdir(parent).then(function(parentDirectory) {
        parentDirectory.getDirectory(dir, {create: true, exclusive: false}, (directory: DirectoryEntry) => {
          log.info('directory created.')
          resolve(directory);
        }, (err) => {
          log.fileError(err);
          reject(err);
        });
      }, (err) => {
        log.fileError(err);
        reject(err);
      });
    })
  })
}

export const mkdir = _mkdir;
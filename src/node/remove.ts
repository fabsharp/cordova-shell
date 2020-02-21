const fs = require('fs-extra')
import * as log from './log';

export const remove = (path : string) : Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.emptyDir(path, err => {
      if(err) {
        reject(err);
      }
      else {
        log.info('removed ' + path);
        resolve();
      }
    });
  });
};
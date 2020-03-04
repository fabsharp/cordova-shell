const fs = require('fs-extra');
import * as log from './log';

export const remove = (path : string) : Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stat) => {
      if(err){
        reject(err);
      } else {
        if(stat.isFile()){
          fs.remove(path, err => {
            if(err) {
              reject(err);
            } else {
              log.info('removed ' + path);
              resolve();
            }
          });
        } else {
          fs.emptyDir(path, err => {
            if(err) {
              reject(err);
            }
            else {
              fs.rmdir(path, (err) => {
                if(err) {
                  reject(err);
                } else {
                  log.info('removed ' + path);
                  resolve();
                }
              });
            }
          });
        }
      }
    });
  });
};

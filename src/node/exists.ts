import * as log from './log'

const fs = require('fs');

export const exists = (url : string) : Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {

      if (fs.existsSync(url)) {
        log.info('file exists.');
        resolve(true);
      }
      else {
        console.log("NOPE")
        resolve(false);
      }
    }
    catch(err) {
      log.info('files does not exists.');
      resolve(false);
    }
  });
};
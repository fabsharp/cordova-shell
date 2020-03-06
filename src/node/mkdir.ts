import {ShellEntry} from "../ShellEntry";
import {getEntry} from "./utils/getEntry";
import * as log from './log';
const fs = require('fs-extra');

export function mkdir(path : string) : Promise<ShellEntry> {
  return new Promise((resolve, reject) => {
    try {
      fs.ensureDir(path, err => {
        if(err){
          reject(err);
        } else {
          getEntry(path).then(entry => {
            log.info('directory created.')
            resolve(entry);
          }, reject)
        }
      });
    }
    catch(ex) {
      reject(ex);
    }
  });
}

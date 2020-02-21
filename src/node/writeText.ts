import {ShellEntry} from "../ShellEntry";
import {ls} from "./ls";
import * as log from './log/index';
import {getEntry} from "./utils/getEntry";
const fs = require('fs-extra');

export const writeText = (text : string, url : string) : Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    fs.outputFile(url, text, err => {
      if(err) {
        console.error(err);
        reject(err);
      }
      else {
        getEntry(url).then(entry => {
          log.info('file wrote.')
          resolve(entry);
        }, reject);
      }
    })
  })
};
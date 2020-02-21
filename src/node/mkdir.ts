import {ShellEntry} from "../ShellEntry";
import {getEntry} from "./utils/getEntry";
import * as log from './log';
const fsPromises = require('fs').promises;
const mkdirp = require('mkdirp');

export function mkdir(path : string) : Promise<ShellEntry> {
  return new Promise((resolve, reject) => {
    try {
      mkdirp.sync(path);
      return getEntry(path).then(entry => {
        log.info('directory created.')
        resolve(entry);
      }, reject)
    }
    catch(ex) {
      reject(ex);
    }
  });
}
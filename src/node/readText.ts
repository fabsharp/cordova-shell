const fsPromises = require('fs').promises;
import * as log from './log';
export const readText = (url : string) : Promise<string> => {
  return fsPromises.readFile(url, { encoding : "utf-8"}).then(text => {
    log.info(text);
    return text;
  }, Promise.reject);
};
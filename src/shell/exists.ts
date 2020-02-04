import * as log from './log/index';

export const exists = (url : string) : Promise<boolean> => {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(url, entry => {
      log.info('file exists.');
      resolve(true)
    }, err => {
      log.info('files does not exists.');
      resolve(false)
    });
  });
};
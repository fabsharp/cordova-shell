import * as log from './log';
const fs = require('fs-extra');

export const readJSON = (url : string) : Promise<any> => {
 return new Promise((resolve, reject) => {
   fs.readJSON(url, (err, data) => {
     if(err) {
       console.error(err);
       reject(err);
     }
     else {
       log.info(data);
       resolve(data);
     }
   });
 });
};
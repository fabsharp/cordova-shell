import {ls} from './ls';
import {settings} from "../settings";
import {default as _} from 'lodash.flattendeep';

const _fileTree = (path : string) : Promise<Array<string>> => {
  let promises = [];
  return ls(path).then(entries => {
    entries.forEach(entry => {
      if(entry.isFile) {
        promises.push(path + entry.name);
      }
      else {
        promises.push(_fileTree(path + entry.name + '/'));
      }
    });
    return Promise.all(promises).then(result => {
      return _(result);
    });
  });
};

export const fileTree = (path : string, relative : boolean = true) : Promise<Array<string>> => {
  let consoleLog;
  if(settings.consoleLog === true) {
    settings.consoleLog = false;
    consoleLog = true;
  }
  if(!path.endsWith('/')) {
    path += '/';
  }
  return _fileTree(path).then(result => {
    if(relative){
      result = result.map((fileFullPath) => {
        return fileFullPath.split(path)[1];
      });
    }
    if(consoleLog) {
      console.log(result);
      settings.consoleLog = consoleLog;
    }
    return result;
  }, (err) => {
    if(consoleLog) {
      settings.consoleLog = consoleLog;
    }
    return Promise.reject(err);
  })
}


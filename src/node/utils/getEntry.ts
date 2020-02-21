import {ShellEntry} from "../../ShellEntry";
const fsPromises = require('fs').promises;
const path = require('path');

export const getEntry = (url) : Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    let name = path.basename(url);
    let parent = path.dirname(url);
    fsPromises.lstat(url).then(stat => {
      let size = stat.size;
      let isFile = stat.isFile();
      let modificationTime = stat.mtime;
      resolve(new ShellEntry(name, parent, size, modificationTime, isFile, stat));
    }, reject);
  });
};
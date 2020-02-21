import {ShellEntry} from "../ShellEntry";
import {getEntry} from "./utils/getEntry";
import {logEntry} from "./log/logEntry";
const fsPromises = require('fs').promises;

export const ls = (path : string) : Promise<ShellEntry[]> => {
  return fsPromises.readdir(path).then(entries => {
    let results = [];
    entries.forEach(entry => {
      results.push(getEntry(path + entry));
    });
    return Promise.all(results).then(entries => {
      logEntry(entries);
      return entries;
    });
  }, Promise.reject);
};
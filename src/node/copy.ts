import {ShellEntry} from "../ShellEntry";
const fs = require('fs-extra')
import {ls} from "./ls";

export function copy(source : string, dest : string, progressCallback? : (percent) => void) : Promise<ShellEntry> {
  return new Promise((resolve, reject) => {
    fs.copy(source, dest, err => {
      if(err) {
        reject(err);
      }
      else {
        ls(dest).then(entries => {
          resolve(entries[0]);
        }, reject)
      }
    })
  });
}
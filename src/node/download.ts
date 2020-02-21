import {ShellEntry} from "../ShellEntry";
const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
import {getEntry} from "./utils/getEntry";
import * as log from './log';
import {mkdir} from "./mkdir";

export const download = (url : string, dest : string) : Promise<ShellEntry> => {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      // dest could be deep folder
      let parent = path.dirname(dest);
      mkdir(parent).then(() => {
        const writeStream = fs.createWriteStream(dest);
        res.body.pipe(writeStream);
        getEntry(dest).then(entry => {
          log.info("file downloaded");
          resolve(entry);
        }, reject);
      }, reject);
    }, reject);
  });
}
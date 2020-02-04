import {getEntry} from "./utils/getEntry";
import * as log from "./log/index";

export const readText = (url : string) : Promise<string> => {
  return new Promise((resolve, reject) => {
    getEntry(url).then((entry : FileEntry) => {
      entry.file((file : File) => {
        let reader = new FileReader();
        reader.onload = function() {
          log.info(reader.result);
          resolve(<string> reader.result);
        };
        reader.onerror = function(event) {
          reject(event);
        };
        reader.readAsText(file);
      }, reject)
    }, reject)
  });
}
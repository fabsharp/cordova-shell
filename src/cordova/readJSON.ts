import {readText} from "./readText";

export const readJSON = (url : string) : Promise<any> => {
  return readText(url).then(text => {
    return JSON.parse(text);
  });
};
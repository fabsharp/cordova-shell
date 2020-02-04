import {writeText} from "./writeText";

export const writeJSON = (data : any, url : string) : Promise<FileEntry> => {
  return writeText(JSON.stringify(data), url);
}
import {writeText} from "./writeText";
import {ShellEntry} from "../ShellEntry";

export const writeJSON = (data : any, url : string) : Promise<ShellEntry> => {
  return writeText(JSON.stringify(data), url);
};
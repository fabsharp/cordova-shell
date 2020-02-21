import {settings} from "../../settings";
import {ShellEntry} from "../../ShellEntry";

function logEntities(entities : ShellEntry[]) {
  console.table(entities);
}

export const logEntry = (entry : ShellEntry | ShellEntry[]) => {
  if(settings.consoleLog) {
    if(Array.isArray(entry)) {
      logEntities(entry);
    }
    else {
      logEntities([entry]);
    }
  }
};
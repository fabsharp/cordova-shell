import {settings} from "../../settings";

export const logInfo = (...args) => {
  if(settings.consoleLog) {
    console.log.call(args);
  }
};
import {settings} from "../../settings";
import {logFileError} from "./logFileError";

class ConsoleEntity {
  public name : string;
  public modificationTime : string;
  public nativeUrl : string;
  public url : string;
  public internalUrl : string;
  public size : string;
  constructor(entry : Entry, metaData : Metadata) {
    this.name =  entry.name ? entry.name : entry.filesystem.name;
    this.modificationTime = metaData.modificationTime.toLocaleDateString();
    this.nativeUrl = entry.nativeURL;
    this.url = entry.toURL();
    this.internalUrl = entry.toInternalURL();
    this.size = metaData.size.toString();
  }
}

function logEntities(entities : Entry[]) {
  let promises = [];
  entities.forEach((entity) => {
    promises.push(getMetaData(entity).then((metaData) => {
      return new ConsoleEntity(entity, metaData);
    }, (error => logFileError(error))));
  });
  Promise.all(promises).then((consoleEntities) => {
    console.table(consoleEntities, [ 'name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
  });
}

function getMetaData(entity : Entry) : Promise<Metadata> {
  return new Promise<Metadata>((resolve, reject) => {
    entity.getMetadata((metadata) => {
      resolve(metadata);
    }, (error) => {
      logFileError(error);
      reject(error);
    });
  });
}

export const logEntry = (entry : Entry | Entry[]) => {
  if(settings.consoleLog) {
    if(Array.isArray(entry)) {
      logEntities(entry);
    }
    else {
      logEntities([entry]);
    }
  }
}
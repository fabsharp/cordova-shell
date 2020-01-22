export class ConsoleEntity {
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

function getMetaData(entity : Entry) : Promise<Metadata> {
  return new Promise<Metadata>((resolve, reject) => {
    entity.getMetadata((metadata) => {
      resolve(metadata);
    }, (error) => {
      logError(error);
      reject(error);
    });
  });
}


// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#list-of-error-codes-and-meanings
function logError(error : FileError) {
  let resolved = false;
  Object.getOwnPropertyNames(FileError).forEach((property) => {
    if(["length", "name", "arguments", "caller", "prototype"].indexOf(property) === -1) {
      if(FileError[property] === error.code) {
        resolved = true;
        console.error(property);
      }
    }
  });
  if(!resolved) {
    console.error(error);
  }
}

function logEntity(entity : Entry) {
  getMetaData(entity).then((metadata) => {
    let consoleEntity = new ConsoleEntity(entity, metadata);
    console.table([consoleEntity],  [ 'name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
  }, (error : FileError) => {
    logError(error);
  });
}

function logEntities(entities : Entry[]) {
  let promises = [];
  entities.forEach((entity) => {
    promises.push(getMetaData(entity).then((metaData) => {
      return new ConsoleEntity(entity, metaData);
    }, (error => logError(error))));
  });
  Promise.all(promises).then((consoleEntities) => {
    console.table(consoleEntities, [ 'name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
  });
}

export function log(entry : Entry | Entry[] | FileError) {
  if(entry instanceof FileError) {
    logError(<FileError> entry);
  }
  else {
    if(Array.isArray(entry)) {
      let entries = <Entry[]> entry;
      logEntities(entries);
    }
    else {
      logEntity(entry);
    }
  }
}

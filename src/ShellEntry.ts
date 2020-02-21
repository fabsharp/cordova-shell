import {logFileError} from "./cordova/log/logFileError";

export class ShellEntry {
  isDirectory : boolean;
  constructor(public name : string, public path : string, public size : number, public modificationTime : Date, public isFile : boolean, public nativeEntry : any) {
    this.isDirectory = !this.isFile;
  }

  static fromCordova(entry : Entry) : Promise<ShellEntry> {
    return getMetaData(entry).then(meta => {
      let name =  entry.name ? entry.name : entry.filesystem.name;
      let modificationTime = meta.modificationTime;
      return new ShellEntry(entry.name, entry.fullPath, meta.size, modificationTime, entry.isFile, entry);
    })
  }
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
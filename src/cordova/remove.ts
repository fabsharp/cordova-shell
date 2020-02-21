import * as log from "./log/index";

export const remove = (path : string) : Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    window.resolveLocalFileSystemURL(path, entry => {
      if(entry.isFile) {
        entry.remove(() => {
          log.info('removed ' + entry.fullPath)
          resolve();
        }, (err) => {
          log.fileError(err);
          reject(err);
        })
      }
      else {
        let dir = <DirectoryEntry> entry;
        dir.removeRecursively(() => {
          log.info('removed ' + dir.fullPath)
          resolve();
        }, (err) => {
          log.fileError(err);
          reject(err);
        });
      }
    }, (err) => {
      log.fileError(err);
      reject(err);
    });
  })
};
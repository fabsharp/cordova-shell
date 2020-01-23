function extractFileName(url : string) {
  let split = url.split('/');
  let fileName = split.pop();
  return {
    file : fileName,
    directory : split.join('/') + '/'
  };
}

function getEntry(url) : Promise<Entry> {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(url, entry => {resolve(entry)}, err => reject(err));
  });
}

export default {
  ls(path : string) : Promise<Entry | Entry[]> {
    // if it's a directory it sould end with a slash
    // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/1203361#1203361
    let extension = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
    if(extension === path) {
      // it's a directory
      if(!path.endsWith('/')) {
        path += '/';
      }
    }
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(path, (entry) => {
        if(entry.isFile) {
          resolve(entry);
        }
        else {
          let dir = <DirectoryEntry> entry;
          let reader = dir.createReader();
          reader.readEntries(entries => resolve(entries), reject)
        }
      }, reject)
    });
  },

  mkdir(path : string) : Promise<DirectoryEntry> {
    let split = path.split('/');
    let dir = split.pop();
    // case 1) cdvfile://localhost/persistent/updatable/
    // case 2) cdvfile://localhost/persistent/updatable
    // In case 1 last split member is '';
    if(dir === '') {
      dir = split.pop();
    }
    let parent = split.join('/') + '/';
    return new Promise((resolve, reject) => {
      getEntry(parent).then((parentDirectory : DirectoryEntry) => {
          parentDirectory.getDirectory(dir, { create : true, exclusive : false}, (directory : DirectoryEntry) => {
            resolve(directory);
          }, reject)
      })
    })
  },
  remove(path : string) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      window.resolveLocalFileSystemURL(path, entry => {
        if(entry.isFile) {
          entry.remove(() => {
            resolve();
          }, reject)
        }
        else {
          let dir = <DirectoryEntry> entry;
          dir.removeRecursively(() => {
            resolve();
          }, reject);
        }
      }, reject);
    })
  },
  copy(source : string, dest : string, progressCallback? : (percent) => void ) : Promise<Entry> {
    // TODO : progressCallback
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(source, entry => {
        if(entry.isFile) {
          let extract = extractFileName(dest);
          let newName = extract.file;
          let directory = extract.directory;
          window.resolveLocalFileSystemURL(directory, (parentDirectory) => {
            let _parent = <DirectoryEntry> parentDirectory;
            entry.copyTo(_parent, newName, item => {
              resolve(item);
            }, reject);
          }, reject);
        }
        else {
          // entry is a directory
          this.mkdir(dest).then((destDirectory) => {
            this.ls(source).then((entries) => {
              let promises = [];
              entries.forEach((entry) => {
                promises.push(this.copy(source + '/' + entry.name, dest + '/' + entry.name));
              });
              Promise.all(promises).then(() => {
                resolve(destDirectory);
              });
            }, reject);
          }, reject)
        }
      }, reject);
    });
  },
  download(url : string, dest : string) : Promise<FileEntry> {
    return fetch(url).then((response : Response) => {
      if(response.ok) {
        return response.blob()
      }
      else {
        return Promise.reject(response);
      }
    }).then((blob : Blob) => {
      let extract = extractFileName(dest);
      let newName = extract.file;
      let directory = extract.directory;
      return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(directory, (parentDirectory : DirectoryEntry) => {
          parentDirectory.getFile(newName, {create : true, exclusive : false}, (entry : FileEntry) => {
            entry.createWriter((writer : FileWriter) => {
              writer.onwriteend = function() {
                resolve(entry);
              };
              writer.onerror = function(e) {
                reject(e);
              };
              writer.write(blob);
            }, reject);
          }, reject)
        }, reject)
      });
    }, (err) => Promise.reject(err))
  },
  exists(url : string) : Promise<Entry> {
    return getEntry(url);
  },
  readText(url : string) : Promise<string> {
    return new Promise((resolve, reject) => {
      getEntry(url).then((entry : FileEntry) => {
        entry.file((file : File) => {
          let reader = new FileReader();
          reader.onload = function() {
            resolve(<string> reader.result);
          };
          reader.onerror = function(event) {
            reject(event);
          };
          reader.readAsText(file);
        }, reject)
      }, reject)
    });
  },
  readJSON(url : string) : Promise<any> {
    // TODO : useReadText
    return new Promise((resolve, reject) => {
      getEntry(url).then((entry : FileEntry) => {
        entry.file((file : File) => {
          let reader = new FileReader();
          reader.onload = function() {
            resolve(JSON.parse(<string> reader.result));
          };
          reader.onerror = function(event) {
            reject(event);
          };
          reader.readAsText(file);
        }, reject)
      }, reject)
    });
  },
  writeText(text : string, url : string) : Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      let extract = extractFileName(url);
      let fileName = extract.file;
      let directory = extract.directory;
      getEntry(directory).then((directory : DirectoryEntry) => {
        directory.getFile(fileName, {create : true, exclusive : false}, (file) => {
          let writer = file.createWriter(fileWriter => {
            fileWriter.onwriteend = function() {
              resolve(file);
            };
            fileWriter.onerror = Promise.reject;
            fileWriter.write(text);
          }, Promise.reject);
        }, Promise.reject);
      })
    });
  },
  writeJSON(obj : any, url : string) : Promise<FileEntry> {
    // TODO : use writeText
    return new Promise((resolve, reject) => {
      let extract = extractFileName(url);
      let fileName = extract.file;
      let directory = extract.directory;
      getEntry(directory).then((directory : DirectoryEntry) => {
        directory.getFile(fileName, {create : true, exclusive : false}, (file) => {
          let writer = file.createWriter(fileWriter => {
            fileWriter.onwriteend = function() {
              resolve(file);
            };
            fileWriter.onerror = Promise.reject;
            fileWriter.write(JSON.stringify(obj));
          }, Promise.reject);
        }, Promise.reject);
      })
    });
  }
}
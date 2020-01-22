(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.shell = factory());
}(this, (function () { 'use strict';

  console.log("cordova-shell.js v1.0.0")

  function extractFileName(url) {
      var split = url.split('/');
      var fileName = split.pop();
      return {
          file: fileName,
          directory: split.join('/') + '/'
      };
  }
  function getEntry(url) {
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(url, function (entry) { resolve(entry); }, function (err) { return reject(err); });
      });
  }
  var shellCommands = {
      ls: function (path) {
          return new Promise(function (resolve, reject) {
              window.resolveLocalFileSystemURL(path, function (entry) {
                  if (entry.isFile) {
                      resolve(entry);
                  }
                  else {
                      var dir = entry;
                      var reader = dir.createReader();
                      reader.readEntries(function (entries) { return resolve(entries); }, reject);
                  }
              }, reject);
          });
      },
      mkdir: function (path) {
          var split = path.split('/');
          var dir = split.pop();
          var parent = split.join('/');
          return new Promise(function (resolve, reject) {
              return getEntry(parent).then(function (parentDirectory) {
                  parentDirectory.getDirectory(dir, { create: true, exclusive: false }, function (directory) {
                      return directory;
                  }, reject);
              });
          });
      },
      remove: function (path) {
          return new Promise(function (resolve, reject) {
              window.resolveLocalFileSystemURL(path, function (entry) {
                  if (entry.isFile) {
                      entry.remove(function () {
                          resolve();
                      }, reject);
                  }
                  else {
                      var dir = entry;
                      dir.removeRecursively(function () {
                          resolve();
                      }, reject);
                  }
              });
          });
      },
      copy: function (source, dest) {
          return new Promise(function (resolve, reject) {
              window.resolveLocalFileSystemURL(source, function (entry) {
                  if (entry.isFile) {
                      var extract = extractFileName(dest);
                      var newName_1 = extract.file;
                      var directory = extract.directory;
                      window.resolveLocalFileSystemURL(directory, function (parentDirectory) {
                          var _parent = parentDirectory;
                          entry.copyTo(_parent, newName_1, function (item) {
                              resolve(item);
                          }, reject);
                      }, reject);
                  }
              }, reject);
          });
      },
      download: function (url, dest) {
          return fetch(url).then(function (response) {
              if (response.ok) {
                  return response.blob();
              }
              else {
                  window.console.error("???", response);
                  return Promise.reject(response);
              }
          }).then(function (blob) {
              var extract = extractFileName(dest);
              var newName = extract.file;
              var directory = extract.directory;
              return new Promise(function (resolve, reject) {
                  window.resolveLocalFileSystemURL(directory, function (parentDirectory) {
                      parentDirectory.getFile(newName, { create: true, exclusive: false }, function (entry) {
                          entry.createWriter(function (writer) {
                              writer.onwriteend = function () {
                                  resolve(entry);
                              };
                              writer.onerror = function (e) {
                                  reject(e);
                              };
                              writer.write(blob);
                          }, reject);
                      }, reject);
                  }, reject);
              });
          }, function (err) { return Promise.reject(err); });
      },
      exists: function (url) {
          return getEntry(url);
      },
      readText: function (url) {
          return new Promise(function (resolve, reject) {
          });
      }
  };

  var ConsoleEntity = /** @class */ (function () {
      function ConsoleEntity(entry, metaData) {
          this.name = entry.name ? entry.name : entry.filesystem.name;
          this.modificationTime = metaData.modificationTime.toLocaleDateString();
          this.nativeUrl = entry.nativeURL;
          this.url = entry.toURL();
          this.internalUrl = entry.toInternalURL();
          this.size = metaData.size.toString();
      }
      return ConsoleEntity;
  }());
  function getMetaData(entity) {
      return new Promise(function (resolve, reject) {
          entity.getMetadata(function (metadata) {
              resolve(metadata);
          }, function (error) {
              logError(error);
              reject(error);
          });
      });
  }
  // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#list-of-error-codes-and-meanings
  function logError(error) {
      var resolved = false;
      Object.getOwnPropertyNames(FileError).forEach(function (property) {
          if (["length", "name", "arguments", "caller", "prototype"].indexOf(property) === -1) {
              if (FileError[property] === error.code) {
                  resolved = true;
                  console.error(property);
              }
          }
      });
      if (!resolved) {
          console.error(error);
      }
  }
  function logEntity(entity) {
      getMetaData(entity).then(function (metadata) {
          var consoleEntity = new ConsoleEntity(entity, metadata);
          console.table([consoleEntity], ['name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
      }, function (error) {
          logError(error);
      });
  }
  function logEntities(entities) {
      var promises = [];
      entities.forEach(function (entity) {
          promises.push(getMetaData(entity).then(function (metaData) {
              return new ConsoleEntity(entity, metaData);
          }, (function (error) { return logError(error); })));
      });
      Promise.all(promises).then(function (consoleEntities) {
          console.table(consoleEntities, ['name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
      });
  }
  function log(entry) {
      if (entry instanceof FileError) {
          logError(entry);
      }
      else {
          if (Array.isArray(entry)) {
              var entries = entry;
              logEntities(entries);
          }
          else {
              logEntity(entry);
          }
      }
  }

  var shellConsole = {
      ls: function (path) {
          return shellCommands.ls(path).then(function (entries) {
              if (Array.isArray(entries)) {
                  if (entries.length > 0) {
                      log(entries);
                  }
                  else {
                      window.console.log('directory is empty.');
                  }
              }
              else {
                  window.console.log('file found : ' + entries.name);
                  log(entries);
              }
              return Promise.resolve(entries);
          }, function (err) {
              window.console.error(err);
              return Promise.reject(err);
          });
      },
      remove: function (path) {
          return shellCommands.remove(path).then(function () {
              window.console.log('removed ' + path);
              return Promise.resolve();
          }, function (err) {
              log(err);
              return Promise.reject(err);
          });
      },
      copy: function (source, dest) {
          return shellCommands.copy(source, dest).then(function (entry) {
              window.console.log(entry.name + ' copied.');
              return Promise.resolve(entry);
          }, function (err) {
              log(err);
              return Promise.reject(err);
          });
      },
      download: function (source, dest) {
          return shellCommands.download(source, dest).then(function (entry) {
              window.console.log('file downloaded.');
              log(entry);
              return Promise.resolve(entry);
          }, function (err) {
              log(err);
              return Promise.reject(err);
          });
      },
      exists: function (path) {
          return shellCommands.exists(path).then(function (entry) {
              window.console.log(path + ' exists.');
              return Promise.resolve(entry);
          }, function () {
              window.console.warn(path + ' does not exists.');
              return Promise.resolve(null);
          });
      },
      mkdir: function (path) {
          return shellCommands.mkdir(path).then(function (directory) {
              window.console.log('directory created.');
              return Promise.resolve(directory);
          }, function (err) {
              window.console.error('error creating directory');
              log(err);
              return Promise.reject(err);
          });
      }
  };

  /// <reference path="../node_modules/cordova-plugin-file/types/index.d.ts" />
  var shell;
  (function (shell) {
      /**
       * List information about the FILEs
       * @param path
       */
      function ls(path) {
          return shellCommands.ls(path);
      }
      shell.ls = ls;
      /**
       * Remove a file or a directory
       * @param path
       */
      function remove(path) {
          return shellCommands.remove(path);
      }
      shell.remove = remove;
      /**
       * Copy a source to a dest
       * @param source
       * @param dest
       */
      function copy(source, dest) {
          return shellCommands.copy(source, dest);
      }
      shell.copy = copy;
      /**
       * Download a remote file to a local folder
       * @param url
       * @param dest
       */
      function download(url, dest) {
          return shellCommands.download(url, dest);
      }
      shell.download = download;
      /**
       * Check if a file or a directory exists
       * @param url
       */
      function exists(url) {
          return shellCommands.exists(url);
      }
      shell.exists = exists;
      /**
       * Create a directory (parent must exists)
       * @param path
       */
      function mkdir(path) {
          return shellCommands.mkdir(path);
      }
      shell.mkdir = mkdir;
      /**
       * Use shell commands in the devTools. Output results to the console.
       */
      var console;
      (function (console) {
          /**
           * Map all shell.console commands to the window global object.
           * For example shell.console.ls => window.ls so you can call ls directly in the chrome devTools
           */
          function mapToWindows() {
              window['ls'] = shellCommands.ls;
              window['remove'] = shellCommands.remove;
              window['copy'] = shellCommands.copy;
              window['download'] = shellCommands.download;
              window['exists'] = shellCommands.exists;
              window['mkdir'] = shellCommands.mkdir;
          }
          console.mapToWindows = mapToWindows;
          /**
           * List information about the FILEs
           * @param path
           */
          function ls(path) {
              return shellConsole.ls(path);
          }
          console.ls = ls;
          /**
           * Remove a file or a directory
           * @param path
           */
          function remove(path) {
              return shellConsole.remove(path);
          }
          console.remove = remove;
          /**
           * Copy a source to a dest
           * @param source
           * @param dest
           */
          function copy(source, dest) {
              return shellConsole.copy(source, dest);
          }
          console.copy = copy;
          /**
           * Download a remote file to a local folder
           * @param url
           * @param dest
           */
          function download(url, dest) {
              return shellConsole.download(url, dest);
          }
          console.download = download;
          /**
           * Check if a file or a directory exists
           * @param url
           */
          function exists(url) {
              return shellConsole.exists(url);
          }
          console.exists = exists;
          /**
           * Create a directory (parent must exists)
           * @param path
           */
          function mkdir(path) {
              return shellCommands.mkdir(path);
          }
          console.mkdir = mkdir;
      })(console = shell.console || (shell.console = {}));
  })(shell || (shell = {}));
  var shell$1 = shell;

  return shell$1;

})));
//# sourceMappingURL=cordova-shell.js.map

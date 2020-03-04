(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.shell = {}));
}(this, (function (exports) { 'use strict';

  console.log("cordova-shell.js v0.9.13")

  var _consoleLog = false;
  var settings = {
      get consoleLog() {
          return _consoleLog;
      },
      set consoleLog(value) {
          _consoleLog = value;
      }
  };

  // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#list-of-error-codes-and-meanings
  var logFileError = function (error) {
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
  function logEntities(entities) {
      var promises = [];
      entities.forEach(function (entity) {
          promises.push(getMetaData(entity).then(function (metaData) {
              return new ConsoleEntity(entity, metaData);
          }, (function (error) { return logFileError(error); })));
      });
      Promise.all(promises).then(function (consoleEntities) {
          console.table(consoleEntities, ['name', 'size', 'modificationTime', 'url', 'internalUrl', 'nativeUrl']);
      });
  }
  function getMetaData(entity) {
      return new Promise(function (resolve, reject) {
          entity.getMetadata(function (metadata) {
              resolve(metadata);
          }, function (error) {
              logFileError(error);
              reject(error);
          });
      });
  }
  var logEntry = function (entry) {
      if (settings.consoleLog) {
          if (Array.isArray(entry)) {
              logEntities(entry);
          }
          else {
              logEntities([entry]);
          }
      }
  };

  var logInfo = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      if (settings.consoleLog) {
          console.log.call(args);
      }
  };

  var ShellEntry = /** @class */ (function () {
      function ShellEntry(name, path, size, modificationTime, isFile, nativeEntry) {
          this.name = name;
          this.path = path;
          this.size = size;
          this.modificationTime = modificationTime;
          this.isFile = isFile;
          this.nativeEntry = nativeEntry;
          this.isDirectory = !this.isFile;
      }
      ShellEntry.fromCordova = function (entry) {
          return getMetaData$1(entry).then(function (meta) {
              var name = entry.name ? entry.name : entry.filesystem.name;
              var modificationTime = meta.modificationTime;
              return new ShellEntry(entry.name, entry.fullPath, meta.size, modificationTime, entry.isFile, entry);
          });
      };
      return ShellEntry;
  }());
  function getMetaData$1(entity) {
      return new Promise(function (resolve, reject) {
          entity.getMetadata(function (metadata) {
              resolve(metadata);
          }, function (error) {
              logFileError(error);
              reject(error);
          });
      });
  }

  var ls = function (path) {
      // if it's a directory it sould end with a slash
      // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/1203361#1203361
      var extension = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
      if (extension === path) {
          // it's a directory
          if (!path.endsWith('/')) {
              path += '/';
          }
      }
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(path, function (entry) {
              if (entry.isFile) {
                  logInfo('file found : ' + entry.name);
                  ShellEntry.fromCordova(entry).then(function (shellEntry) {
                      resolve([shellEntry]);
                  });
              }
              else {
                  var dir = entry;
                  var reader = dir.createReader();
                  reader.readEntries(function (entries) {
                      logEntry(entries);
                      var promises = [];
                      entries.forEach(function (entry) {
                          promises.push(ShellEntry.fromCordova(entry));
                      });
                      Promise.all(promises).then(function (shellEntries) {
                          resolve(shellEntries);
                      });
                  }, function (err) {
                      logFileError(err);
                      reject(err);
                  });
              }
          }, function (err) {
              logFileError(err);
              reject(err);
          });
      });
  };

  var getEntry = function (url) {
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(url, function (entry) { resolve(entry); }, function (err) { return reject(err); });
      });
  };

  function _mkdir(path) {
      var split = path.split('/');
      var dir = split.pop();
      // case 1) cdvfile://localhost/persistent/updatable/
      // case 2) cdvfile://localhost/persistent/updatable
      // In case 1 last split member is '';
      if (dir === '') {
          dir = split.pop();
      }
      var parent = split.join('/') + '/';
      return new Promise(function (resolve, reject) {
          getEntry(parent).then(function (parentDirectory) {
              parentDirectory.getDirectory(dir, { create: true, exclusive: false }, function (directory) {
                  logInfo('directory created.');
                  ShellEntry.fromCordova(directory).then(function (shellEntry) {
                      resolve(shellEntry);
                  });
              }, function (err) {
                  logFileError(err);
                  reject(err);
              });
          }, function () {
              return _mkdir(parent).then(function (parentDirectory) {
                  parentDirectory.nativeEntry.getDirectory(dir, { create: true, exclusive: false }, function (directory) {
                      logInfo('directory created.');
                      ShellEntry.fromCordova(directory).then(function (shellEntry) {
                          resolve(shellEntry);
                      });
                  }, function (err) {
                      logFileError(err);
                      reject(err);
                  });
              }, function (err) {
                  logFileError(err);
                  reject(err);
              });
          });
      });
  }
  var mkdir = _mkdir;

  var remove = function (path) {
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(path, function (entry) {
              if (entry.isFile) {
                  entry.remove(function () {
                      logInfo('removed ' + entry.fullPath);
                      resolve();
                  }, function (err) {
                      logFileError(err);
                      reject(err);
                  });
              }
              else {
                  var dir_1 = entry;
                  dir_1.removeRecursively(function () {
                      logInfo('removed ' + dir_1.fullPath);
                      resolve();
                  }, function (err) {
                      logFileError(err);
                      reject(err);
                  });
              }
          }, function (err) {
              logFileError(err);
              reject(err);
          });
      });
  };

  var extractFileName = function (url) {
      var split = url.split('/');
      var fileName = split.pop();
      return {
          file: fileName,
          directory: split.join('/') + '/'
      };
  };

  function _copy(source, dest, progressCallback) {
      // TODO : progressCallback
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(source, function (entry) {
              if (entry.isFile) {
                  var extract = extractFileName(dest);
                  var newName_1 = extract.file;
                  var directory = extract.directory;
                  window.resolveLocalFileSystemURL(directory, function (parentDirectory) {
                      var _parent = parentDirectory;
                      entry.copyTo(_parent, newName_1, function (item) {
                          logInfo(entry.name + ' copied.');
                          ShellEntry.fromCordova(item).then(function (shellEntry) {
                              resolve(shellEntry);
                          });
                      }, function (err) {
                          logFileError(err);
                          reject(err);
                      });
                  }, function (err) {
                      logFileError(err);
                      reject(err);
                  });
              }
              else {
                  // entry is a directory
                  mkdir(dest).then(function (destDirectory) {
                      ls(source).then(function (entries) {
                          var promises = [];
                          entries.forEach(function (entry) {
                              promises.push(_copy(source + '/' + entry.name, dest + '/' + entry.name));
                          });
                          Promise.all(promises).then(function () {
                              logInfo(source + ' copied.');
                              resolve(destDirectory);
                          });
                      }, reject);
                  }, reject);
              }
          }, function (err) {
              logFileError(err);
              reject(err);
          });
      });
  }
  var copy = _copy;

  var download = function (url, dest, progressCallback) {
      return new Promise(function (resolve, reject) {
          var extract = extractFileName(dest);
          var newName = extract.file;
          var directory = extract.directory;
          mkdir(directory).then(function (directoryEntry) {
              directoryEntry.nativeEntry.getFile(newName, { create: true, exclusive: false }, function (entry) {
                  launchDownloadStreamXHR(url, entry, progressCallback).then(function (file) {
                      resolve(file);
                  }).catch(function (err) {
                      reject(err);
                  });
              }, function (error) {
                  logFileError(error);
                  reject(error);
              });
          }, reject);
      });
  };
  var launchDownloadStreamXHR = function (url, entry, progressCallback) {
      return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'blob';
          xhr.onerror = function (err) {
              reject(err);
          };
          if (typeof progressCallback === 'function') {
              xhr.onprogress = function (e) {
                  if (e.lengthComputable) {
                      progressCallback({
                          action: 'downloading',
                          loaded: e.loaded,
                          total: e.total,
                          percentDownloading: (e.loaded > 0) ? ((e.loaded / e.total) * 100) : 0,
                          percent: (e.loaded > 0) ? ((e.loaded / e.total) * 50) : 0,
                      });
                  }
              };
          }
          xhr.onload = function () {
              if (this.status == 200) {
                  progressCallback({
                      action: 'downloading',
                      loaded: this.response.size,
                      total: this.response.size,
                      percentDownloading: 100,
                      percent: 50,
                  });
                  var blob = new Blob([this.response], { type: 'application/octet-binary' });
                  writeFile(entry, blob, progressCallback).then(function (file) {
                      resolve(file);
                  }).catch(function (err) {
                      reject(err);
                  });
              }
          };
          xhr.send();
      });
  };
  var writeFile = function (entry, data, progressCallback) {
      return new Promise(function (resolve, reject) {
          entry.createWriter(function (fileWriter) {
              fileWriter.onerror = function (err) {
                  logInfo("Failed file write: " + err.toString());
                  reject(err);
              };
              function writeFinish() {
                  function success() {
                      progressCallback({
                          action: 'writing',
                          written: data.size,
                          total: data.size,
                          percentWriting: 100,
                          percent: 100,
                      });
                      ShellEntry.fromCordova(entry).then(function (shellEntry) {
                          resolve(shellEntry);
                      });
                  }
                  function fail(error) {
                      logInfo("Unable to retrieve file properties: " + error.code);
                      reject(error);
                  }
                  entry.file(success, fail);
              }
              var written = 0;
              var BLOCK_SIZE = 1 * 1024 * 1024; // write 1M every time of write
              function writeNext(cbFinish) {
                  fileWriter.onwrite = function () {
                      if (written < data.size) {
                          writeNext(cbFinish);
                      }
                      else {
                          cbFinish();
                      }
                  };
                  if (written) {
                      fileWriter.seek(fileWriter.length);
                  }
                  if (typeof progressCallback === 'function') {
                      progressCallback({
                          action: 'writing',
                          written: written,
                          total: data.size,
                          percentWriting: ((written / data.size) * 100) || 0,
                          percent: 50 + ((written / data.size) * 50),
                      });
                  }
                  fileWriter.write(data.slice(written, written + Math.min(BLOCK_SIZE, data.size - written)));
                  written += Math.min(BLOCK_SIZE, data.size - written);
              }
              writeNext(writeFinish);
          });
      });
  };

  var exists = function (url) {
      return new Promise(function (resolve, reject) {
          window.resolveLocalFileSystemURL(url, function (entry) {
              logInfo('file exists.');
              resolve(true);
          }, function (err) {
              logInfo('files does not exists.');
              resolve(false);
          });
      });
  };

  var readText = function (url) {
      return new Promise(function (resolve, reject) {
          getEntry(url).then(function (entry) {
              entry.file(function (file) {
                  var reader = new FileReader();
                  reader.onload = function () {
                      logInfo(reader.result);
                      resolve(reader.result);
                  };
                  reader.onerror = function (event) {
                      reject(event);
                  };
                  reader.readAsText(file);
              }, reject);
          }, reject);
      });
  };

  var readJSON = function (url) {
      return readText(url).then(function (text) {
          return JSON.parse(text);
      });
  };

  var writeText = function (text, url) {
      return new Promise(function (resolve, reject) {
          var extract = extractFileName(url);
          var fileName = extract.file;
          var directory = extract.directory;
          getEntry(directory).then(function (directory) {
              directory.getFile(fileName, { create: true, exclusive: false }, function (file) {
                  var writer = file.createWriter(function (fileWriter) {
                      fileWriter.onwriteend = function () {
                          logInfo('file wrote.');
                          ShellEntry.fromCordova(file).then(function (shellEntry) {
                              resolve(shellEntry);
                          });
                      };
                      fileWriter.onerror = Promise.reject;
                      fileWriter.write(text);
                  }, Promise.reject);
              }, Promise.reject);
          });
      });
  };

  var writeJSON = function (data, url) {
      return writeText(JSON.stringify(data), url);
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]';

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Built-in value references. */
  var Symbol = root.Symbol,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
  function isFlattenable(value) {
    return isArray(value) || isArguments(value) ||
      !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  /**
   * Recursively flattens `array`.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flattenDeep([1, [2, [3, [4]], 5]]);
   * // => [1, 2, 3, 4, 5]
   */
  function flattenDeep(array) {
    var length = array ? array.length : 0;
    return length ? baseFlatten(array, INFINITY) : [];
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  var D__xampp_htdocs_mainDev_DEV_TOOLS_cordovaShell_node_modules_lodash_flattendeep = flattenDeep;

  var _fileTree = function (path) {
      var promises = [];
      return ls(path).then(function (entries) {
          entries.forEach(function (entry) {
              if (entry.isFile) {
                  promises.push(path + entry.name);
              }
              else {
                  promises.push(_fileTree(path + entry.name + '/'));
              }
          });
          return Promise.all(promises).then(function (result) {
              return D__xampp_htdocs_mainDev_DEV_TOOLS_cordovaShell_node_modules_lodash_flattendeep(result);
          });
      });
  };
  var fileTree = function (path, relative) {
      if (relative === void 0) { relative = true; }
      var consoleLog;
      if (settings.consoleLog === true) {
          settings.consoleLog = false;
          consoleLog = true;
      }
      if (!path.endsWith('/')) {
          path += '/';
      }
      return _fileTree(path).then(function (result) {
          if (relative) {
              result = result.map(function (fileFullPath) {
                  return fileFullPath.split(path)[1];
              });
          }
          if (consoleLog) {
              console.log(result);
              settings.consoleLog = consoleLog;
          }
          return result;
      }, function (err) {
          if (consoleLog) {
              settings.consoleLog = consoleLog;
          }
          return Promise.reject(err);
      });
  };

  var consoleLog = function (value) {
      settings.consoleLog = value;
  };

  exports.consoleLog = consoleLog;
  exports.copy = copy;
  exports.download = download;
  exports.exists = exists;
  exports.fileTree = fileTree;
  exports.ls = ls;
  exports.mkdir = mkdir;
  exports.readJSON = readJSON;
  exports.readText = readText;
  exports.remove = remove;
  exports.writeJSON = writeJSON;
  exports.writeText = writeText;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cordova-shell.js.map

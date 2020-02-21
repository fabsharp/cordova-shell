'use strict';

console.log("node-shell.js v0.9.11")

Object.defineProperty(exports, '__esModule', { value: true });

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
        return getMetaData(entry).then(function (meta) {
            var name = entry.name ? entry.name : entry.filesystem.name;
            var modificationTime = meta.modificationTime;
            return new ShellEntry(entry.name, entry.fullPath, meta.size, modificationTime, entry.isFile, entry);
        });
    };
    return ShellEntry;
}());
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

var fsPromises = require('fs').promises;
var path = require('path');
var getEntry = function (url) {
    return new Promise(function (resolve, reject) {
        var name = path.basename(url);
        var parent = path.dirname(url);
        fsPromises.lstat(url).then(function (stat) {
            var size = stat.size;
            var isFile = stat.isFile();
            var modificationTime = stat.mtime;
            resolve(new ShellEntry(name, parent, size, modificationTime, isFile, stat));
        }, reject);
    });
};

function logEntities(entities) {
    console.table(entities);
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

var fsPromises$1 = require('fs').promises;
var ls = function (path) {
    return fsPromises$1.readdir(path).then(function (entries) {
        var results = [];
        entries.forEach(function (entry) {
            results.push(getEntry(path + entry));
        });
        return Promise.all(results).then(function (entries) {
            logEntry(entries);
            return entries;
        });
    }, Promise.reject);
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

var fsPromises$2 = require('fs').promises;
var mkdirp = require('mkdirp');
function mkdir(path) {
    return new Promise(function (resolve, reject) {
        try {
            mkdirp.sync(path);
            return getEntry(path).then(function (entry) {
                logInfo('directory created.');
                resolve(entry);
            }, reject);
        }
        catch (ex) {
            reject(ex);
        }
    });
}

var fs = require('fs-extra');
var remove = function (path) {
    return new Promise(function (resolve, reject) {
        fs.emptyDir(path, function (err) {
            if (err) {
                reject(err);
            }
            else {
                logInfo('removed ' + path);
                resolve();
            }
        });
    });
};

var fs$1 = require('fs-extra');
function copy(source, dest, progressCallback) {
    return new Promise(function (resolve, reject) {
        fs$1.copy(source, dest, function (err) {
            if (err) {
                reject(err);
            }
            else {
                ls(dest).then(function (entries) {
                    resolve(entries[0]);
                }, reject);
            }
        });
    });
}

var http = require('http');
var fs$2 = require('fs');
var fetch = require('node-fetch');
var path$1 = require('path');
var download = function (url, dest) {
    return new Promise(function (resolve, reject) {
        fetch(url).then(function (res) {
            // dest could be deep folder
            var parent = path$1.dirname(dest);
            mkdir(parent).then(function () {
                var writeStream = fs$2.createWriteStream(dest);
                res.body.pipe(writeStream);
                getEntry(dest).then(function (entry) {
                    logInfo("file downloaded");
                    resolve(entry);
                }, reject);
            }, reject);
        }, reject);
    });
};

var fs$3 = require('fs');
var exists = function (url) {
    return new Promise(function (resolve, reject) {
        try {
            if (fs$3.existsSync(url)) {
                logInfo('file exists.');
                resolve(true);
            }
            else {
                console.log("NOPE");
                resolve(false);
            }
        }
        catch (err) {
            logInfo('files does not exists.');
            resolve(false);
        }
    });
};

var fsPromises$3 = require('fs').promises;
var readText = function (url) {
    return fsPromises$3.readFile(url, { encoding: "utf-8" }).then(function (text) {
        logInfo(text);
        return text;
    }, Promise.reject);
};

var fs$4 = require('fs-extra');
var readJSON = function (url) {
    return new Promise(function (resolve, reject) {
        fs$4.readJSON(url, function (err, data) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                logInfo(data);
                resolve(data);
            }
        });
    });
};

var fs$5 = require('fs-extra');
var writeText = function (text, url) {
    return new Promise(function (resolve, reject) {
        fs$5.outputFile(url, text, function (err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                getEntry(url).then(function (entry) {
                    logInfo('file wrote.');
                    resolve(entry);
                }, reject);
            }
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

var D__src_cordovaShell_node_modules_lodash_flattendeep = flattenDeep;

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
            return D__src_cordovaShell_node_modules_lodash_flattendeep(result);
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
//# sourceMappingURL=node-shell.js.map

console.log("cordova-shell.js v0.9.3")

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

var ls = function (path, consoleLog) {
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
                resolve([entry]);
            }
            else {
                var dir = entry;
                var reader = dir.createReader();
                reader.readEntries(function (entries) {
                    logEntry(entries);
                    resolve(entries);
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
                resolve(directory);
            }, function (err) {
                logFileError(err);
                reject(err);
            });
        }, function () {
            return _mkdir(parent).then(function (parentDirectory) {
                parentDirectory.getDirectory(dir, { create: true, exclusive: false }, function (directory) {
                    logInfo('directory created.');
                    resolve(directory);
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
                        resolve(item);
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

var download = function (url, dest) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.blob();
        }
        else {
            return Promise.reject(response);
        }
    }).then(function (blob) {
        var extract = extractFileName(dest);
        var newName = extract.file;
        var directory = extract.directory;
        return new Promise(function (resolve, reject) {
            mkdir(directory).then(function (directoryEntry) {
                directoryEntry.getFile(newName, { create: true, exclusive: false }, function (entry) {
                    entry.createWriter(function (writer) {
                        writer.onwriteend = function () {
                            logInfo('file downloaded.');
                            resolve(entry);
                        };
                        writer.onerror = function (e) {
                            reject(e);
                        };
                        writer.write(blob);
                    });
                }, function (error) {
                    logFileError(error);
                    reject(error);
                });
            }, reject);
        });
    }, function (err) { return Promise.reject(err); });
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
                        resolve(file);
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

/// <reference path="../node_modules/cordova-plugin-file/types/index.d.ts" />
var shell;
(function (shell) {
    /**
     * List information about the FILEs
     * @param path
     */
    shell.ls = ls;
    /**
     * Create a directory
     * @param path
     */
    shell.mkdir = mkdir;
    /**
     * Remove a file or a directory
     * @param path
     */
    shell.remove = remove;
    /**
     * Copy a source to a dest
     * @param source
     * @param dest
     */
    shell.copy = copy;
    /**
     * Download a remote file to a local folder
     * @param url
     * @param dest
     */
    shell.download = download;
    /**
     * Check if a file or a directory exists
     * @param url
     */
    shell.exists = exists;
    /**
     * Read a file and return content as text.
     * @param url
     */
    shell.readText = readText;
    /**
     * Read a file and return content as object.
     * @param url
     */
    shell.readJSON = readJSON;
    /**
     * Write text to a file.
     * @param text
     * @param url
     */
    shell.writeText = writeText;
    /**
     * Write object to a file.
     * @param obj
     * @param url
     */
    shell.writeJSON = writeJSON;
    /**
     * Show details in console.log
     * default : false
     */
    shell.consoleLog = settings.consoleLog;
})(shell || (shell = {}));

export { shell };
//# sourceMappingURL=index.js.map

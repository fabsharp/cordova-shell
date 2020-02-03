console.log("cordova-shell.js v0.9.3")

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
        var _this = this;
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
                    resolve(directory);
                }, reject);
            }, function () {
                return _this.mkdir(parent).then(function (parentDirectory) {
                    parentDirectory.getDirectory(dir, { create: true, exclusive: false }, function (directory) {
                        resolve(directory);
                    }, reject);
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
            }, reject);
        });
    },
    copy: function (source, dest, progressCallback) {
        var _this = this;
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
                            resolve(item);
                        }, reject);
                    }, reject);
                }
                else {
                    // entry is a directory
                    _this.mkdir(dest).then(function (destDirectory) {
                        _this.ls(source).then(function (entries) {
                            var promises = [];
                            entries.forEach(function (entry) {
                                promises.push(_this.copy(source + '/' + entry.name, dest + '/' + entry.name));
                            });
                            Promise.all(promises).then(function () {
                                resolve(destDirectory);
                            });
                        }, reject);
                    }, reject);
                }
            }, reject);
        });
    },
    download: function (url, dest) {
        var _this = this;
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
                _this.mkdir(directory).then(function (directoryEntry) {
                    directoryEntry.getFile(newName, { create: true, exclusive: false }, function (entry) {
                        entry.createWriter(function (writer) {
                            writer.onwriteend = function () {
                                resolve(entry);
                            };
                            writer.onerror = function (e) {
                                reject(e);
                            };
                            writer.write(blob);
                        });
                    });
                });
            });
        }, function (err) { return Promise.reject(err); });
    },
    exists: function (url) {
        return new Promise(function (resolve, reject) {
            try {
                window.resolveLocalFileSystemURL(url, function (entry) { resolve(true); }, function (err) { return resolve(false); });
            }
            catch (_a) {
                alert('!! carched');
            }
        });
    },
    readText: function (url) {
        return new Promise(function (resolve, reject) {
            getEntry(url).then(function (entry) {
                entry.file(function (file) {
                    var reader = new FileReader();
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                    reader.onerror = function (event) {
                        reject(event);
                    };
                    reader.readAsText(file);
                }, reject);
            }, reject);
        });
    },
    readJSON: function (url) {
        // TODO : useReadText
        return new Promise(function (resolve, reject) {
            getEntry(url).then(function (entry) {
                entry.file(function (file) {
                    var reader = new FileReader();
                    reader.onload = function () {
                        resolve(JSON.parse(reader.result));
                    };
                    reader.onerror = function (event) {
                        reject(event);
                    };
                    reader.readAsText(file);
                }, reject);
            }, reject);
        });
    },
    writeText: function (text, url) {
        return new Promise(function (resolve, reject) {
            var extract = extractFileName(url);
            var fileName = extract.file;
            var directory = extract.directory;
            getEntry(directory).then(function (directory) {
                directory.getFile(fileName, { create: true, exclusive: false }, function (file) {
                    var writer = file.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function () {
                            resolve(file);
                        };
                        fileWriter.onerror = Promise.reject;
                        fileWriter.write(text);
                    }, Promise.reject);
                }, Promise.reject);
            });
        });
    },
    writeJSON: function (obj, url) {
        // TODO : use writeText
        return new Promise(function (resolve, reject) {
            var extract = extractFileName(url);
            var fileName = extract.file;
            var directory = extract.directory;
            getEntry(directory).then(function (directory) {
                directory.getFile(fileName, { create: true, exclusive: false }, function (file) {
                    var writer = file.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function () {
                            resolve(file);
                        };
                        fileWriter.onerror = Promise.reject;
                        fileWriter.write(JSON.stringify(obj));
                    }, Promise.reject);
                }, Promise.reject);
            });
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
            log(err);
            return Promise.resolve(null);
        });
    },
    remove: function (path) {
        return shellCommands.remove(path).then(function () {
            window.console.log('removed ' + path);
            return Promise.resolve();
        }, function (err) {
            log(err);
            return Promise.resolve(null);
        });
    },
    copy: function (source, dest) {
        return shellCommands.copy(source, dest).then(function (entry) {
            window.console.log(entry.name + ' copied.');
            return Promise.resolve(entry);
        }, function (err) {
            log(err);
            return Promise.resolve(null);
        });
    },
    download: function (source, dest) {
        return shellCommands.download(source, dest).then(function (entry) {
            window.console.log('file downloaded.');
            log(entry);
            return Promise.resolve(entry);
        }, function (err) {
            log(err);
            return Promise.resolve(null);
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
            return Promise.resolve(null);
        });
    },
    readText: function (path) {
        return shellCommands.readText(path).then(function (text) {
            window.console.log(text);
            return Promise.resolve(text);
        }, function (err) {
            window.console.error(err);
            return Promise.resolve(null);
        });
    },
    readJSON: function (url) {
        return shellCommands.readJSON(url).then(function (json) {
            window.console.log(json);
            return Promise.resolve(json);
        }, function (err) {
            window.console.error(err);
            return Promise.resolve(null);
        });
    },
    writeText: function (text, url) {
        return shellCommands.writeText(text, url).then(function (file) {
            window.console.log(file.name + ' wrote');
            log(file);
            return Promise.resolve(file);
        }, function (err) {
            window.console.error(err);
            return Promise.resolve(null);
        });
    },
    writeJSON: function (obj, url) {
        return shellCommands.writeJSON(obj, url).then(function (file) {
            window.console.log(file.name + ' wrote');
            log(file);
            return Promise.resolve(file);
        }, function (err) {
            window.console.error(err);
            return Promise.resolve(null);
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
     * Read a file and return content as text.
     * @param url
     */
    function readText(url) {
        return shellCommands.readText(url);
    }
    shell.readText = readText;
    /**
     * Read a file and return content as object.
     * @param url
     */
    function readJSON(url) {
        return shellCommands.readJSON(url);
    }
    shell.readJSON = readJSON;
    /**
     *  Write text to a file.
     * @param text
     * @param url
     */
    function writeText(text, url) {
        return shellCommands.writeText(text, url);
    }
    shell.writeText = writeText;
    /**
     * Write object to a file.
     * @param obj
     * @param url
     */
    function writeJSON(obj, url) {
        return shellCommands.writeJSON(obj, url);
    }
    shell.writeJSON = writeJSON;
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
            window['ls'] = shellConsole.ls;
            window['remove'] = shellConsole.remove;
            window['copy'] = shellConsole.copy;
            window['download'] = shellConsole.download;
            window['exists'] = shellConsole.exists;
            window['mkdir'] = shellConsole.mkdir;
            window['readText'] = shellConsole.readText;
            window['readJSON'] = shellConsole.readJSON;
            window['writeText'] = shellConsole.writeText;
            window['writeJSON'] = shellConsole.writeJSON;
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
            return shellConsole.mkdir(path);
        }
        console.mkdir = mkdir;
        /**
         * Read a file and return content as text.
         * @param path
         */
        function readText(path) {
            return shellConsole.readText(path);
        }
        console.readText = readText;
        /**
         * Read a file and return content as object.
         * @param path
         */
        function readJSON(path) {
            return shellConsole.readJSON(path);
        }
        console.readJSON = readJSON;
        /**
         * Write text to a file.
         * @param text
         * @param url
         */
        function writerText(text, url) {
            return shellConsole.writeText(text, url);
        }
        console.writerText = writerText;
        /**
         * Write object to a file.
         * @param text
         * @param url
         */
        function writerJSON(text, url) {
            return shellConsole.writeJSON(text, url);
        }
        console.writerJSON = writerJSON;
    })(console = shell.console || (shell.console = {}));
})(shell || (shell = {}));
var shell$1 = shell;

export default shell$1;
//# sourceMappingURL=index.js.map

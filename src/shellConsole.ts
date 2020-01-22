import {default as shell} from "./shellCommands";
import {log} from "./log";

export default {
  ls: (path: string) : Promise<Entry | Entry[] | null> => {
    return shell.ls(path).then(entries => {
      if (Array.isArray(entries)) {
        if (entries.length > 0) {
          log(entries);
        } else {
          window.console.log('directory is empty.');
        }
      } else {
        window.console.log('file found : ' + entries.name);
        log(entries);
      }
      return Promise.resolve(entries);
    }, err => {
      log(err);
      return Promise.resolve(null);
    })
  },
  remove: (path: string) : Promise<void> => {
    return shell.remove(path).then(() => {
      window.console.log('removed ' + path);
      return Promise.resolve();
    }, err => {
      log(err);
      return Promise.resolve(null);
    });
  },
  copy: (source: string, dest: string) : Promise<Entry | null>  => {
    return shell.copy(source, dest).then(entry => {
      window.console.log(entry.name + ' copied.');
      return Promise.resolve(entry);
    }, err => {
      log(err);
      return Promise.resolve(null);
    });
  },
  download: (source: string, dest: string) : Promise<FileEntry | null> => {
    return shell.download(source, dest).then(entry => {
      window.console.log('file downloaded.');
      log(entry);
      return Promise.resolve(entry);
    }, err => {
      log(err);
      return Promise.resolve(null);
    });
  },
  exists: (path: string) : Promise<Entry | null> => {
    return shell.exists(path).then((entry) => {
      window.console.log(path + ' exists.');
      return Promise.resolve(entry)
    }, () => {
      window.console.warn(path + ' does not exists.');
      return Promise.resolve(null);
    })
  },
  mkdir: (path : string) : Promise<DirectoryEntry | null> => {
    return shell.mkdir(path).then( directory => {
      window.console.log('directory created.')
      return Promise.resolve(directory);
    }, (err) => {
      window.console.error('error creating directory')
      log(err);
      return Promise.resolve(null);
    })
  },
  readText : (path : string) : Promise<string> => {
    return shell.readText(path).then( text => {
      window.console.log(text);
      return Promise.resolve(text);
    }, (err) => {
      window.console.error(err);
      return Promise.resolve(null);
    })
  },
  readJSON(url: string): Promise<any> {
    return shell.readJSON(url).then( json => {
      window.console.log(json);
      return Promise.resolve(json);
    }, (err) => {
      window.console.error(err);
      return Promise.resolve(null);
    })
  },
  writeText : (text : string, url : string) : Promise<FileEntry | null> => {
    return shell.writeText(text, url).then( file => {
      window.console.log(file.name + ' wrote');
      log(file);
      return Promise.resolve(file);
    }, (err) => {
      window.console.error(err);
      return Promise.resolve(null);
    })
  },
  writeJSON : (obj : any, url : string) : Promise<FileEntry | null> => {
    return shell.writeJSON(obj, url).then( file => {
      window.console.log(file.name + ' wrote');
      log(file);
      return Promise.resolve(file);
    }, (err) => {
      window.console.error(err);
      return Promise.resolve(null);
    })
  }
}

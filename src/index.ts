/// <reference path="../node_modules/cordova-plugin-file/types/index.d.ts" />
import {default as shellCommands} from './shellCommands';
import {default as shellConsole} from './shellConsole';

namespace shell {
  /**
   * List information about the FILEs
   * @param path
   */
  export function ls(path: string) : Promise<Entry | Entry[]> {
    return shellCommands.ls(path);
  }

  /**
   * Remove a file or a directory
   * @param path
   */
  export function remove(path : string) : Promise<void> {
    return shellCommands.remove(path);
  }

  /**
   * Copy a source to a dest
   * @param source
   * @param dest
   */
  export function copy(source : string, dest : string) : Promise<Entry> {
    return shellCommands.copy(source, dest);
  }

  /**
   * Download a remote file to a local folder
   * @param url
   * @param dest
   */
  export function download(url: string, dest: string): Promise<FileEntry> {
    return shellCommands.download(url, dest);
  }

  /**
   * Check if a file or a directory exists
   * @param url
   */
  export function exists(url: string): Promise<Entry> {
    return shellCommands.exists(url);
  }

  /**
   * Create a directory (parent must exists)
   * @param path
   */
  export function mkdir(path : string) : Promise<DirectoryEntry> {
    return shellCommands.mkdir(path);
  }

  /**
   * Read a file and return content as text.
   * @param url
   */
  export function readText(url : string) : Promise<string> {
    return shellCommands.readText(url);
  }

  /**
   * Read a file and return content as object.
   * @param url
   */
  export function  readJSON(url : string) : Promise<any> {
    return shellCommands.readJSON(url);
  }

  /**
   *  Write text to a file.
   * @param text
   * @param url
   */
  export function  writeText(text : string, url : string) : Promise<FileEntry> {
    return shellCommands.writeText(text, url);
  }

  /**
   * Write object to a file.
   * @param obj
   * @param url
   */
  export function writeJSON(obj : any, url : string) : Promise<FileEntry> {
    return shellCommands.writeJSON(obj, url);
  }
  /**
   * Use shell commands in the devTools. Output results to the console.
   */
  export namespace console {
    /**
     * Map all shell.console commands to the window global object.
     * For example shell.console.ls => window.ls so you can call ls directly in the chrome devTools
     */
    export function mapToWindows() {
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
    /**
     * List information about the FILEs
     * @param path
     */
    export function ls(path: string) : Promise<Entry | Entry[] | null> {
      return shellConsole.ls(path);
    }

    /**
     * Remove a file or a directory
     * @param path
     */
    export function remove(path : string) : Promise<void> {
      return shellConsole.remove(path);
    }

    /**
     * Copy a source to a dest
     * @param source
     * @param dest
     */
    export function copy(source : string, dest : string) : Promise<Entry | null> {
      return shellConsole.copy(source, dest);
    }

    /**
     * Download a remote file to a local folder
     * @param url
     * @param dest
     */
    export function download(url: string, dest: string): Promise<FileEntry | null> {
      return shellConsole.download(url, dest);
    }

    /**
     * Check if a file or a directory exists
     * @param url
     */
    export function exists(url: string): Promise<Entry | null > {
      return shellConsole.exists(url);
    }

    /**
     * Create a directory (parent must exists)
     * @param path
     */
    export function mkdir(path : string) : Promise<DirectoryEntry | null> {
      return shellConsole.mkdir(path);
    }

    /**
     * Read a file and return content as text.
     * @param path
     */
    export function readText(path : string) : Promise<string | null> {
      return shellConsole.readText(path);
    }

    /**
     * Read a file and return content as object.
     * @param path
     */
    export function readJSON(path : string) : Promise<any> {
      return shellConsole.readJSON(path);
    }

    /**
     * Write text to a file.
     * @param text
     * @param url
     */
    export function writerText(text : string, url : string) : Promise<FileEntry | null> {
      return shellConsole.writeText(text, url);
    }

    /**
     * Write object to a file.
     * @param text
     * @param url
     */
    export function writerJSON(text : string, url : string) : Promise<FileEntry | null> {
      return shellConsole.writeJSON(text, url);
    }
  }
};

export default shell;

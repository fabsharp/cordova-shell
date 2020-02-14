/// <reference path="../node_modules/cordova-plugin-file/types/index.d.ts" />
import * as _shell from './shell/index';
export module shell {
  /**
   * List information about the FILEs
   * @param path
   */
  export const ls = _shell.ls;
  /**
   * Create a directory
   * @param path
   */
  export const mkdir = _shell.mkdir;
  /**
   * Remove a file or a directory
   * @param path
   */
  export const remove = _shell.remove;
  /**
   * Copy a source to a dest
   * @param source
   * @param dest
   */
  export const copy = _shell.copy;
  /**
   * Download a remote file to a local folder
   * @param url
   * @param dest
   */
  export const download = _shell.download;
  /**
   * Check if a file or a directory exists
   * @param url
   */
  export const exists = _shell.exists;
  /**
   * Read a file and return content as text.
   * @param url
   */
  export const readText = _shell.readText;
  /**
   * Read a file and return content as object.
   * @param url
   */
  export const readJSON = _shell.readJSON;
  /**
   * Write text to a file.
   * @param text
   * @param url
   */
  export const writeText = _shell.writeText;
  /**
   * Write object to a file.
   * @param obj
   * @param url
   */
  export const writeJSON = _shell.writeJSON;

  /**
   * Get all files and folder
   * @returns an Array of string
   */
  export const fileTree = _shell.fileTree;
  /**
   * Show details in console.log
   * param value (default : false)
   */
  export const consoleLog = _shell.consoleLog;
}
declare module shell {
  interface ShellEntry {
    name : string;
    path : string;
    size : number;
    modificationTime : Date;
    isFile : boolean;
    isDirectory : boolean;
    nativeEntry : any;
  }
  /**
   * List information about the FILEs
   * @param path
   */
  const ls: (path: string) => Promise<ShellEntry[]>;
  /**
   * Create a directory
   * @param path
   */
  const mkdir: (path: string) => Promise<ShellEntry>;
  /**
   * Remove a file or a directory
   * @param path
   */
  const remove: (path: string) => Promise<void>;
  /**
   * Copy a source to a dest
   * @param source
   * @param dest
   */
  const copy: (source: string, dest: string, progressCallback?: (percent: any) => void) => Promise<ShellEntry>;
  /**
   * Download a remote file to a local folder
   * @param url
   * @param dest
   */
  const download: (url: string, dest: string, progressCallback? : (progress: any) => void) => Promise<ShellEntry>;
  /**
   * Check if a file or a directory exists
   * @param url
   */
  const exists: (url: string) => Promise<boolean>;
  /**
   * Read a file and return content as text.
   * @param url
   */
  const readText: (url: string) => Promise<string>;
  /**
   * Read a file and return content as object.
   * @param url
   */
  const readJSON: (url: string) => Promise<any>;
  /**
   * Write text to a file.
   * @param text
   * @param url
   */
  const writeText: (text: string, url: string) => Promise<ShellEntry>;
  /**
   * Write object to a file.
   * @param obj
   * @param url
   */
  const writeJSON: (data: any, url: string) => Promise<ShellEntry>;
  /**
   * Get all files and folder
   * @returns an Array of string
   */
  const fileTree: (path : string) => Promise<Array<string>>;
  /**
   * Show details in console.log
   * param value (default : false)
   */
  const consoleLog: (value: boolean) => void;
}

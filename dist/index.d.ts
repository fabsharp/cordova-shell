/// <reference types="cordova-plugin-file" />
declare module shell {
    /**
     * List information about the FILEs
     * @param path
     */
    function ls(path: string): Promise<Entry | Entry[]>;
    /**
     * Remove a file or a directory
     * @param path
     */
    function remove(path: string): Promise<void>;
    /**
     * Copy a source to a dest
     * @param source
     * @param dest
     */
    function copy(source: string, dest: string): Promise<Entry>;
    /**
     * Download a remote file to a local folder
     * @param url
     * @param dest
     */
    function download(url: string, dest: string): Promise<FileEntry>;
    /**
     * Check if a file or a directory exists
     * @param url
     */
    function exists(url: string): Promise<boolean>;
    /**
     * Create a directory (parent must exists)
     * @param path
     */
    function mkdir(path: string): Promise<DirectoryEntry>;
    /**
     * Read a file and return content as text.
     * @param url
     */
    function readText(url: string): Promise<string>;
    /**
     * Read a file and return content as object.
     * @param url
     */
    function readJSON(url: string): Promise<any>;
    /**
     *  Write text to a file.
     * @param text
     * @param url
     */
    function writeText(text: string, url: string): Promise<FileEntry>;
    /**
     * Write object to a file.
     * @param obj
     * @param url
     */
    function writeJSON(obj: any, url: string): Promise<FileEntry>;
    /**
     * Use shell commands in the devTools. Output results to the console.
     */
    namespace console {
        /**
         * Map all shell.console commands to the window global object.
         * For example shell.console.ls => window.ls so you can call ls directly in the chrome devTools
         */
        function mapToWindows(): void;
        /**
         * List information about the FILEs
         * @param path
         */
        function ls(path: string): Promise<Entry | Entry[] | null>;
        /**
         * Remove a file or a directory
         * @param path
         */
        function remove(path: string): Promise<void>;
        /**
         * Copy a source to a dest
         * @param source
         * @param dest
         */
        function copy(source: string, dest: string): Promise<Entry | null>;
        /**
         * Download a remote file to a local folder
         * @param url
         * @param dest
         */
        function download(url: string, dest: string): Promise<FileEntry | null>;
        /**
         * Check if a file or a directory exists
         * @param url
         */
        function exists(url: string): Promise<Entry | null>;
        /**
         * Create a directory (parent must exists)
         * @param path
         */
        function mkdir(path: string): Promise<DirectoryEntry | null>;
        /**
         * Read a file and return content as text.
         * @param path
         */
        function readText(path: string): Promise<string | null>;
        /**
         * Read a file and return content as object.
         * @param path
         */
        function readJSON(path: string): Promise<any>;
        /**
         * Write text to a file.
         * @param text
         * @param url
         */
        function writerText(text: string, url: string): Promise<FileEntry | null>;
        /**
         * Write object to a file.
         * @param text
         * @param url
         */
        function writerJSON(text: string, url: string): Promise<FileEntry | null>;
    }
}
export default shell;

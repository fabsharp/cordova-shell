/// <reference types="cordova-plugin-file" />
declare namespace shell {
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
    function exists(url: string): Promise<Entry>;
    /**
     * Use shell commands in the devTools. Output results to the console.
     */
    namespace console {
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
        function exists(url: string): Promise<Entry | null>;
    }
}
export default shell;

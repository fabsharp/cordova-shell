// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#list-of-error-codes-and-meanings
export const logFileError = (error : FileError) => {
  let resolved = false;
  Object.getOwnPropertyNames(FileError).forEach((property) => {
    if(["length", "name", "arguments", "caller", "prototype"].indexOf(property) === -1) {
      if(FileError[property] === error.code) {
        resolved = true;
        console.error(property);
      }
    }
  });
  if(!resolved) {
    console.error(error);
  }
};
export const getEntry = (url) : Promise<Entry> => {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(url, entry => {resolve(entry)}, err => reject(err));
  });
}
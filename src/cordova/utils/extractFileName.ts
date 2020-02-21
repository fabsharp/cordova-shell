export const extractFileName = (url : string) => {
  let split = url.split('/');
  let fileName = split.pop();
  return {
    file : fileName,
    directory : split.join('/') + '/'
  };
};
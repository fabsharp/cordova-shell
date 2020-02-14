import {settings} from './settings';
export {ls} from './ls';
export {mkdir} from './mkdir';
export {remove} from './remove';
export {copy} from './copy';
export {download} from './download';
export {exists} from './exists';
export {readText} from './readText';
export {readJSON} from './readJSON';
export {writeText} from './writeText';
export {writeJSON} from './writeJSON';
export {fileTree} from './fileTree';
export const consoleLog = (value : boolean) => {
  settings.consoleLog = value;
};
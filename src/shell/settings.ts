let _consoleLog = false;
export let settings = {
  get consoleLog() : boolean {
    return _consoleLog;
  },
  set consoleLog(value : boolean) {
    _consoleLog = value;
  }
};
Cordova shell is a javascript wrapper around the [Apache Cordova Plugin File](https://github.com/apache/cordova-plugin-file) to give you an easy access to the device filesystem.

```js
ls('cdvfile://localhost/persistent/');
mkdir('cdvfile://localhost/persistent/data/');
writeText('hello world', 'cdvfile://localhost/persistent/data/hello.txt');
copy('cdvfile://localhost/persistent/data/hello.txt', cordova.file.dataDirectory);
ls(cordova.file.dataDirectory);
download('https://www.w3.org/TR/PNG/iso_8859-1.txt', 'cdvfile://localhost/persistent/data/iso.txt');
readText('cdvfile://localhost/persistent/data/iso.txt')
remove('cdvfile://localhost/persistent/data/iso.txt');
remove('cdvfile://localhost/persistent/data/');
```

If you are not familiar with this kind of url you can check [this](https://github.com/apache/cordova-plugin-file#where-to-store-files) and the [cdvfile protocol](https://github.com/apache/cordova-plugin-file#cdvfile-protocol)

# Install
- Add [Apache Cordova Plugin File](https://github.com/apache/cordova-plugin-file) to your cordova app :
```bash
cordova plugin add cordova-plugin-file
```
- Download cordova-shell.js and copy it to your cordova _**www**_ directory

- reference the script in **_www/index.html_**
```html
<script src="cordova-shell.js"></script>
```

# Getting started
You can use the cordova-shell to 
1. debug (with devTools)
2. develop your app

## Use cordova-shell in chrome devTools to access the device filesytem
In case you miss it your can [inspect your cordova app with chrome devtools](https://geeklearning.io/apache-cordova-and-remote-debugging-on-android/) ([even on iOS](https://medium.com/@channaly/how-debug-cordova-based-application-with-chrome-dev-tool-43e095a735b4))

Cordova shell give you access to the device filesystem in devTools :

![Image of Yaktocat](doc/capture1.png)

Note the first instruction :
```js
    shell.console.mapToWindows();
```
By default all the console commands are in the _shell.console_ namespace :
```js
shell.console.ls('cdvfile://localhost/persistent'))
```
shell.console.mapToWindows() create a global variable for each shell.console commands :
```js
ls('cdvfile://localhost/persistent'))
```

You can find the list of shell commands available in the [Console API](doc/console.api.md).

## Use cordova-shell to develop your app
The same commands are available to use in your code without logging to the console.
```js
shell.mkdir(cordova.file.dataDirectory + '/data');
shell.ls('cdvfile://localhost/persistent').then((entries) => {
    entries.forEach((entry) => {
        if(entry.isFile) {
            shell.copy(entry.toURL(), cordova.file.dataDirectory + '/data')
        }
        else {
            if(entry.isDirectory) {
                shell.remove(entry.toURL())
            }       
        }          
    })
});
```
cordova-shell always returns cordova-plugin-file objects... that are not very well documented but I recommand you to have a look at [this file](https://github.com/apache/cordova-plugin-file/blob/master/types/index.d.ts)

You can find the list of shell commands available in the [Shell API](doc/shell.api.md).
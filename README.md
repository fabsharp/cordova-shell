Cordova shell is a javascript wrapper around the [Apache Cordova Plugin File](https://github.com/apache/cordova-plugin-file) to give you an easy access to the device filesystem.

For documentation see the [definition file](https://raw.githubusercontent.com/fabsharp/cordova-shell/master/dist/index.d.ts)
```
shell.consoleLog(true);

shell.ls('cdvfile://localhost/persistent/');

shell.mkdir('cdvfile://localhost/persistent/data/');

shell.writeText('hello world', 'cdvfile://localhost/persistent/data/hello.txt');

shell.copy('cdvfile://localhost/persistent/data/hello.txt', cordova.file.dataDirectory);

shell.ls(cordova.file.dataDirectory);

shell.download('https://www.w3.org/TR/PNG/iso_8859-1.txt', 'cdvfile://localhost/persistent/data/iso.txt');

shell.readText('cdvfile://localhost/persistent/data/iso.txt')

shell.remove('cdvfile://localhost/persistent/data/iso.txt');

shell.remove('cdvfile://localhost/persistent/data/');
```



# Install
- Add [Apache Cordova Plugin File](https://github.com/apache/cordova-plugin-file) to your cordova app :
```bash
cordova plugin add cordova-plugin-file
```
- Download cordova-shell.js and copy it to your cordova _**www**_ directory

- reference the script in **_www/index.html_**
```html
<script src="cordova-shell.js"></script>
<script>
    shell.ls('cdvfile://localhost/persistent');
</script>
```

# Import module
```
npm install cordova-shell
```

```js
import {shell} from 'cordova-shell';

shell.ls("cdvfile://localhost/persistent").then(entries => {
    console.log(entries);
});
```
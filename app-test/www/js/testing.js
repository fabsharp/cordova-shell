document.addEventListener('deviceready', function() {
   shell.console.mapToWindows();
   ls('cdvfile://localhost/persistent/');
   shell.mkdir('cdvfile://localhost/persistent/data/').then(() => {
       Promise.all([
            shell.download('http://192.168.1.90:666/hello.json', 'cdvfile://localhost/persistent/data/hello.json'),
            shell.download('http://192.168.1.90:666/hello.txt', 'cdvfile://localhost/persistent/data/hello.txt'),
           shell.mkdir('cdvfile://localhost/persistent/data/subdir').then(() => {
               shell.download('http://192.168.1.90:666/hello.json', 'cdvfile://localhost/persistent/data/subdir/hello.json')
           })
       ]).then(() => {
           console.log("files downloaded")
           //ls('cdvfile://localhost/persistent/data');
           mkdir(cordova.file.dataDirectory + 'data').then(() => {
               shell.copy('cdvfile://localhost/persistent/data', cordova.file.dataDirectory + 'data').then(() => {
                   console.log("files copied");
                   ls(cordova.file.dataDirectory + 'data');
               })
           })

       })

   })
});
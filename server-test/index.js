const ip = require("ip");
const express = require('express');
const app = express();
var cors = require('cors')

app.use(cors());
app.use(express.static('./server-test/www/'));

let port = 666;
app.listen(port, function () {
    let url = 'http://' + ip.address() + ':' + port;
    console.log('Fake http web server listening on ' + url);
});
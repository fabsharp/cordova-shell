const fs = require("fs");
const pkg = require("./package.json");
const mkdirp = require("mkdirp");

pkg.scripts = {};
pkg.devDependencies = {};
pkg.dependencies = {
    "@types/cordova": "0.0.34",
    "@types/cordova-plugin-file": "^4.3.2"
};
pkg.main = 'cordova-shell.js';
pkg.types = 'cordova-shell.d.ts';

mkdirp('dist.npm');
fs.writeFileSync("dist.npm/package.json", Buffer.from(JSON.stringify(pkg, null, 2), "utf-8") );
fs.copyFileSync("README.md", "dist.npm/README.md");
fs.copyFileSync("dist/cordova-shell.js", "dist.npm/cordova-shell.js");
fs.copyFileSync("dist/cordova-shell.js.map", "dist.npm/cordova-shell.js.map");
fs.copyFileSync("dist/index.d.ts", "dist.npm/cordova-shell.d.ts");
console.log('package ready for npmjs.com');
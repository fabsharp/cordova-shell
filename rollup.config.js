import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import pkg from './package.json'
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
export default [{
    input: 'src/cordova/index.ts',
    output: [{
        file: 'dist/cordova-shell.js',
        format: 'umd',
        sourcemap: true,
        name : 'shell',
    }],
    plugins: [
        typescript(),
        resolve({browser:true}),
        commonjs()
    ]
}, {
    input: 'src/node/index.ts',
    output: [{
        file: 'dist/node-shell.js',
        format: 'commonjs',
        sourcemap: true,
        name : 'shell',
    }],
    plugins: [
        typescript(),
        resolve(),
        commonjs()
    ]
}];
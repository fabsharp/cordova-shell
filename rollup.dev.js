import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
export default [{
    input: 'src/cordova/index.ts',
    output: [{
        file: 'app-test/www/js/cordova-shell.js',
        format: 'umd',
        sourcemap: 'inline',
        name : 'shell',
    }],
    plugins: [
        typescript(),
        resolve({browser:true}),
        commonjs(),
    ]
}, {
    input: 'src/node/index.ts',
    output: [{
        file: 'node-test/node-shell.js',
        format: 'commonjs',
        sourcemap: 'inline',
        name : 'shell',
    }],
    plugins: [
        typescript(),
        resolve(),
        commonjs(),
    ]
}];
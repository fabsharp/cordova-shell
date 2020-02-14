import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
export default {
    input: 'src/shell/index.ts',
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
};
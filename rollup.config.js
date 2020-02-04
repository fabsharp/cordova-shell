import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import pkg from './package.json'
export default [{
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'es',
        sourcemap : true,
        intro : 'console.log("cordova-shell.js v' + pkg.version + '")'
    },
    plugins: [
        typescript(),

    ]
}, {
    input : 'src/shell/index.ts',
    output : {
        file: 'dist/cordova-shell.js',
        format: 'umd',
        name: 'shell',
        sourcemap : true,
        intro : 'console.log("cordova-shell.js v' + pkg.version + '")',
    },
    plugins: [
        typescript(
            {
                objectHashIgnoreUnknownHack: true
            }
        ),
        copy({
            objectHashIgnoreUnknownHack : true,
            targets : [
                {src : './src/index.d.ts', dest : './dist'}
            ]
        })
    ]
}];
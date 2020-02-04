import typescript from 'rollup-plugin-typescript2';
export default {
    input: 'src/shell/index.ts',
    output: [{
        file: 'app-test/www/js/cordova-shell.js',
        format: 'umd',
        sourcemap: true,
        name : 'shell',
    }],
    plugins: [
        typescript()
    ]
};
import typescript from 'rollup-plugin-typescript2';
export default {
    input: 'src/index.ts',
    output: {
        file: './app-test/www/js/cordova-shell.js',
        format: 'umd',
        name: 'shell',
        sourcemap : true,
        intro : 'console.log("cordova-shell.js dev version")'
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: false,
                },
            },
        })
    ]
};
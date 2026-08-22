const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['www/js/app.js'],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    outfile: 'www/dist/app.js',
    sourcemap: false,
    minify: false
}).catch(() => process.exit(1));

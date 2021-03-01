import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import cleaner from 'rollup-plugin-cleaner'

import css from 'rollup-plugin-css-only'
import execute from 'rollup-plugin-execute'

import pkg from './package.json'
import manifest from './chrome-ext/manifest.json'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
// const production = !process.env.ROLLUP_WATCH;
const isProduction = process.env.NODE_ENV === 'production'

console.log('[BUILD]')
console.log('PRODUCTION', isProduction)
console.log('PKG VERSION', pkg.version)
console.log('MAN VERSION', manifest.version)

if (pkg.version !== manifest.version) {
  throw new Error(`VERSIONS DON'T MATCH: ${pkg.version} != ${manifest.version}`)
}

const config = ({ inFile, outDir, outFile, plugins = [] }) => ({
  input: inFile,
  output: {
    name: '_GramUp',
    file: `${outDir}${outFile}`, // sorry you need to put / yourself
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    isProduction && cleaner({
      targets: [outDir],
    }),
    resolve({ browser: true, preferBuiltins: true }),
    commonjs(),
    nodePolyfills(),
    // typescript(),
    json(),
    ...plugins,
    isProduction && terser(), // minify, but only in production
  ],
})

export default [
  config({
    inFile: 'src/background/index.js',
    outDir: 'chrome-ext/build/background/',
    outFile: 'index.js',
  }),
  config({
    inFile: 'src/popup/index.js',
    outDir: 'chrome-ext/build/popup/',
    outFile: 'index.js',
    plugins: [
      css({ output: 'style.css' }),
      execute('cp node_modules/bootstrap/dist/css/bootstrap.min.css ./chrome-ext/build/popup/'),
    ],
  }),
]

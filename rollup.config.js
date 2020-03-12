import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import { terser } from 'rollup-plugin-terser';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';
import manifest from './chrome-ext/manifest.json';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
// const production = !process.env.ROLLUP_WATCH;
const isProduction = process.env.NODE_ENV === "production";

console.log('[BUILD]')
console.log('PRODUCTION', isProduction)
console.log('PKG VERSION', pkg.version)
console.log('MAN VERSION', manifest.version)

if (pkg.version !== manifest.version) {
  throw new Error(`VERSIONS DON'T MATCH: ${pkg.version} != ${manifest.version}`);
}

const config = ({ inFile, outFile }) => ({
  input: inFile,
  output: {
    name: "_GramUp",
    file: outFile,
    format: "umd",
    sourcemap: true
  },
  plugins: [
    resolve({ browser: true, preferBuiltins: true }),
    commonjs(),
    nodePolyfills(),
    // typescript(),
    json(),
    isProduction && terser() // minify, but only in production
  ]
});

export default [
  config({
    inFile: 'src/background.js',
    outFile: 'chrome-ext/build/background.js',
  }),
  config({
    inFile: 'src/popup.js',
    outFile: 'chrome-ext/build/popup.js',
  }),
];
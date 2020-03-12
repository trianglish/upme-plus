
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { terser } from 'rollup-plugin-terser';

// import typescript from "@rollup/plugin-typescript";
// import pkg from './package.json';
// import manifest from './chrome-ext/manifest.json';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
// const production = !process.env.ROLLUP_WATCH;
const isProduction = process.env.NODE_ENV === "production";

const config = ({ inFile, outFile }) => ({
  input: inFile,
  output: {
    name: "_GramUp",
    file: outFile,
    format: "umd",
    sourcemap: true
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
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
  // {
  //   input: "chrome-ext/background.js",
  //   output: {
  //     file: "chrome-ext/dist/background.js",
  //     // outDir: "chrome-ext/dist/background",
  //     // dir: "chrome-ext/dist",
  //     format: "mjs",
  //     sourcemap: true
  //   },
  //   plugins: [
  //     resolve(), // so Rollup can find `ms`
  //     commonjs(), // so Rollup can convert `ms` to an ES module
  //     json(),
  //     typescript(),
  //     production && terser() // minify, but only in production
  //   ]
  // },
  // {
  //   input: "chrome-ext/popup.js",
  //   output: {
  //     file: "chrome-ext/dist/popup.js",
  //     // outDir: "chrome-ext/dist/popup",
  //     // dir: "chrome-ext/dist",
  //     format: "mjs",
  //     sourcemap: true
  //   },
  //   plugins: [
  //     resolve(), // so Rollup can find `ms`
  //     commonjs(), // so Rollup can convert `ms` to an ES module
  //     json(),
  //     typescript(),
  //     production && terser() // minify, but only in production
  //   ]
  // }
  //   {
  //     input: "src/index.js",
  //     external: ["ms"],
  //     output: [
  //       { file: pkg.main, format: "cjs" },
  //       { file: pkg.module, format: "es" }
  //     ],
  //     plugins: [
  //       resolve(), // so Rollup can find `ms`
  //       commonjs(), // so Rollup can convert `ms` to an ES module
  //       json(),
  //       production && terser() // minify, but only in production
  //     ]
  //   }
];
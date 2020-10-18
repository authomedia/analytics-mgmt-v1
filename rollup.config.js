import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import dotenv from 'rollup-plugin-dotenv';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import notify from 'rollup-plugin-notify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'public/js/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: !production
  },
  plugins: [
    notify({
      success: true
    }),
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    json(),
    nodeGlobals(),
    builtins({
      preferBuiltins: true
    }), // Add builtins support
    dotenv(), // add .env support
    production && terser() // minify, but only in production
  ]
};

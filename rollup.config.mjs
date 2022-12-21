import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default {
  input: './index.js',
  // input: path.resolve(__dirname, 'dist') + '/xenon_view_sdk.js',
  output: [
    {
      format: 'iife',
      file: path.resolve(__dirname, 'dist') + '/xenon_view_sdk.js',
      name: 'Xenon',
      inlineDynamicImports: true,
    },
    {
      file: path.resolve(__dirname, 'dist') + '/xenon_view_sdk.min.js',
      format: 'iife',
      inlineDynamicImports: true,
      name: 'Xenon',
      plugins: [terser()]
    }
  ],
  plugins: [
    globals(), builtins(), resolve({ browser: true }), commonjs()
  ],
};
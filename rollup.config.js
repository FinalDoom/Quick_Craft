import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescriptPlugin from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import metablock from 'rollup-plugin-userscript-metablock';
import typescript from 'typescript';

const fs = require('fs');
const pkg = require('./package.json');

fs.mkdir('dist/', {recursive: true}, () => null);

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/bundle.user.js',
    format: 'iife',
    name: 'rollupUserScript',
    banner: () =>
      fs.existsSync('./LICENSE')
        ? '\n/*\n' + fs.readFileSync('./LICENSE', 'utf8') + '\n*/\n\n/* globals lunr, React, ReactDOM */'
        : '',
    sourcemap: true,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      lunr: 'lunr',
    },
  },
  plugins: [
    replace({
      __buildDate__: new Date().toUTCString(),
      __buildVersion__: pkg.version,
      __repositoryUrl__: pkg.repository.url,
      'process.env.NODE_ENV': JSON.stringify('production'),
      ENVIRONMENT: JSON.stringify('production'),
      preventAssignment: true,
    }),
    nodeResolve({extensions: ['.js', '.ts', '.tsx']}),
    scss({
      insert: true,
      runtime: require('sass'),
    }),
    json(),
    typescriptPlugin({typescript}),
    commonjs({
      include: ['node_modules/**'],
      exclude: ['node_modules/process-es6/**'],
    }),
    babel({babelHelpers: 'bundled'}),
    metablock({
      file: './meta.js',
      override: {
        version: pkg.version,
        description: pkg.description,
        homepage: pkg.homepage,
        author: pkg.author,
        license: pkg.license,
        downloadURL: `${pkg.homepage}/releases/latest/download/${pkg.name}.user.js`,
      },
    }),
  ],
  external: (id) => /^(lunr|react(-dom)?)$/.test(id),
};

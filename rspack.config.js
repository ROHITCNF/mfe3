// @ts-check
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { createRequire } from 'node:module';

const isDev = process.env.NODE_ENV === 'development';
const require = createRequire(import.meta.url);

export default defineConfig({
  devServer: {
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'auto',
    uniqueName: 'mfe3',
  },
  entry: {
    main: './src/main.jsx',
  },
  target: ['browserslist:last 2 versions, > 0.2%, not dead, Firefox ESR'],
  resolve: {
    extensions: ['...', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.css$/,
        type: 'css/auto',
      },
      {
        test: /\.(?:js|jsx|mjs|cjs)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            /** @type {import('@rspack/core').SwcLoaderOptions} */
            options: {
              detectSyntax: 'auto',
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe3',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: require('react/package.json').version,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: require('react-dom/package.json').version,
        },
      },
    }),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    isDev && new ReactRefreshRspackPlugin(),
  ],
});

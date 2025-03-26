/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

let path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const packageJson = require('./package.json');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'cicero-core.js',
        library: {
            name: 'cicero-core',
            type: 'umd',
        },
    },
    plugins: [
        new webpack.BannerPlugin(`Accord Project Cicero v${packageJson.version}
        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
        Unless required by applicable law or agreed to in writing, software
        distributed under the License is distributed on an "AS IS" BASIS,
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        See the License for the specific language governing permissions and
        limitations under the License.`),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser', // provide a shim for the global `process` variable
        }),
        new NodePolyfillPlugin(),
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.join(__dirname, 'lib')],
                use: ['babel-loader']
            },
            {
                test: /\.ne$/,
                use: ['raw-loader']
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // see https://webpack.js.org/configuration/resolve/#resolvefallback
            // for the list of Node.js core module polyfills.
            'fs': false,
            'tls': false,
            'net': false,
            'child_process': false,
            'os': false,
            'path': false,
            // 'crypto': require.resolve('crypto-browserify'),
            // 'stream': require.resolve('stream-browserify'),
            // 'http': require.resolve('stream-http'),
            // 'https': require.resolve('https-browserify'),
            // 'zlib': require.resolve('browserify-zlib'),
            // 'vm2': require.resolve('vm-browserify'),
        }
    }
};

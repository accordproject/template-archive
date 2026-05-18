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

const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
    target: 'web',
    entry: path.resolve(__dirname, 'index.js'),
    output: {
        clean: false,
        path: path.resolve(__dirname, 'dist'),
        filename: 'cicero-core.browser.js',
        library: {
            name: 'cicero-core',
            type: 'umd',
        },
        globalObject: 'self',
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        mainFields: ['browser', 'module', 'main'],
        alias: {
            // Force CJS entry so webpack can apply path/fs fallbacks to the source.
            // The concerto-core pre-built browser bundle has path=false internally.
            '@accordproject/concerto-core': require.resolve('@accordproject/concerto-core/dist/index.js'),
        },
        fallback: {
            fs:            false,
            path:          require.resolve('path-browserify'),
            net:           false,
            tls:           false,
            child_process: false,
            os:            false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            vm:     false,
        },
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { test: /\.js$/,   loader: 'source-map-loader' },
        ],
    },
    plugins: [
        new webpack.BannerPlugin(
            `Accord Project Cicero v${packageJson.version} — browser build\n` +
            'Licensed under the Apache License, Version 2.0'
        ),
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify('production') },
        }),
        new webpack.ProvidePlugin({
            Buffer:  ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ],
};

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
const packageJson = require('./package.json');

module.exports = {
    entry: {
        client: [
            './index.js'
        ]
    },
    output: {
        path: path.join(__dirname, 'umd'),
        filename: 'cicero.js',
        library: {
            name: 'cicero',
            type: 'umd',
        },
        umdNamedDefine: true,
    },
    plugins: [
        new webpack.BannerPlugin(`Cicero v${packageJson.version}
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
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.$/,
            contextRegExp: /jsdom$/,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.join(__dirname, 'src')],
                use: ['babel-loader']
            },
            {
                test: /\.ne$/,
                use:['raw-loader']
            }
        ]
    },
    resolve: {
        fallback: {
            'fs': false,
            'tls': false,
            'net': false,
            'path': false,
            'os': false,
            'util': false,
            'url': false,
            'child_process': false,
            'assert': require.resolve('assert/'),
            'constants': require.resolve('constants-browserify'),
            'crypto': require.resolve('crypto-browserify'),
            'stream': require.resolve('stream-browserify'),
            'http': require.resolve('stream-http'),
            'https': require.resolve('https-browserify'),
            'zlib': require.resolve('browserify-zlib'),
        }
    }
};
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

// UMD browser bundle. The node entry point is the plain `tsc` output (lib/index.js);
// this config produces only the browser bundle (umd/cicero-core.js). APIs that depend on
// Node built-ins (fs/path/http) — e.g. Template.fromDirectory and the disk/URL loaders —
// are not available in the browser; see README "Browser support".
module.exports = {
    target: 'web',
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
        clean: false,
        path: path.resolve(__dirname, 'umd'),
        filename: 'cicero-core.js',
        library: {
            name: 'cicero-core',
            type: 'umd',
        },
        globalObject: 'self',
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
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
            util:          false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            vm:     false,
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /\.test\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: { transpileOnly: true, configFile: path.resolve(__dirname, 'tsconfig.json') },
                }],
            },
            { test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ },
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

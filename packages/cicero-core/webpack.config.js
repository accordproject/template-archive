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

"use strict";

let path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const packageJson = require("./package.json");

module.exports = {
  target: 'node',
  // Exclude all node_modules from the bundle (looked up from both local and workspace root).
  externals: [
    nodeExternals(),
    nodeExternals({ modulesDir: path.resolve(__dirname, '../../node_modules') }),
  ],
  entry: path.resolve(__dirname, "index.js"),
  output: {
    clean: true,
    path: path.resolve(__dirname, "dist"),
    filename: "cicero-core.js",
    library: {
      type: "commonjs",
    },
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    // Prefer CJS ('main') over ESM ('module') for node target to avoid default-export interop issues.
    mainFields: ["main", "module"],
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      fs: false,
      tls: false,
      net: false,
      child_process: false,
      os: false,
      path: false,
    },
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
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
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
  ],
};

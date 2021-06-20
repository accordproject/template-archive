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

const Metadata = require('./metadata');

/**
 * Defines the metadata for an instance
 * @class
 * @public
 */
class InstanceMetadata extends Metadata {
    /**
     * Create the Metadata.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template}</strong>
     * </p>
     * @param {object} packageJson  - the JS object for package.json (required)
     */
    constructor(packageJson) {
        super(packageJson);
    }

    /**
     * Return new InstanceMetadata for a target runtime
     * @param {string} runtime - the target runtime
     * @return {object} the new Metadata
     */
    createTargetMetadata(runtime) {
        const packageJson = JSON.parse(JSON.stringify(this.packageJson));
        packageJson.accordproject.runtime = runtime;
        return new InstanceMetadata(packageJson);
    }

    /**
     * Return new InstanceMetadata from a TemplateMetadata
     * @param {object} metadata - the template metadata
     * @return {object} the new instance metadata
     */
    static createMetadataFromTemplate(metadata) {
        const packageJson = JSON.parse(JSON.stringify(metadata.getPackageJson()));
        // XXX Should we clean things up?
        if (packageJson.dependencies) {
            delete packageJson.dependencies;
        }
        if (packageJson.devDependencies) {
            delete packageJson.devDependencies;
        }
        if (packageJson.scripts) {
            delete packageJson.scripts;
        }
        return new InstanceMetadata(packageJson);
    }
}

module.exports = InstanceMetadata;

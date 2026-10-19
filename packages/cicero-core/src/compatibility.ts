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

import semver from 'semver';

/**
 * The oldest Cicero version whose templates load unchanged in this version of Cicero.
 *
 * A major release that only changes Cicero's JavaScript API or packaging (as 3.0.0 did)
 * leaves this alone, so templates targeting `^2.0.0` keep loading in 3.x. Raise it to the
 * new version only when a release changes what a template must contain (as 2.0.0 did, by
 * requiring event types to extend `Obligation`).
 */
export const TEMPLATE_COMPATIBILITY_FLOOR = '2.0.0';

/**
 * Returns true if a template that targets `range` can be loaded by Cicero `release` because
 * the range admits a Cicero version between the compatibility floor and `release`.
 *
 * Releases older than the floor get no window: they only load templates whose range they
 * satisfy, as before.
 *
 * @param {string} release the Cicero release version (without a prerelease tag)
 * @param {string} range the semver range of Cicero versions the template targets
 * @returns {boolean} true if the range overlaps the compatibility window
 */
export function withinCompatibilityWindow(release: string, range: string): boolean {
    if (!semver.valid(release) || semver.lt(release, TEMPLATE_COMPATIBILITY_FLOOR)) {
        return false;
    }
    return semver.intersects(range, `>=${TEMPLATE_COMPATIBILITY_FLOOR} <=${release}`);
}

#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# This script assumes that 
# - the remote origin is set to a fork of the repo
# - the remote upstream is set to the original repo

# Exit on first error, print all commands.
set -ev
set -o pipefail

# Make sure we have the latest code from origin/master on our fork
git fetch --all --prune
git checkout master
git merge --ff-only upstream/master
git pull origin master

# Increase the version number
npm run pkgbump
TARGET_VERSION=$( jq -r '.version' lerna.json )
git add package.json
git commit -m "chore(release): Bump Cicero source version" -s

# Publish each package to NPM registry. Generate changelog and update package.json files
lerna publish --conventional-commits -m 'chore(release): publish %s' --force-publish=* --repo-version ${TARGET_VERSION} --yes

# Fix DCO sign-off
git commit --amend -s --no-edit
git push -f origin master

# Merge into upstream/master
echo "Publish of ${TARGET_VERSION} successful."
echo "Now open a pull request to merge origin/master into upstream/master."

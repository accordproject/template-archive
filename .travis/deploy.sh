#!/bin/bash
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

# Script for the deploy phase, to push NPM modules, docker images and
# cloud playground images

# Exit on first error, print all commands.
set -ev
set -o pipefail

# Bring in the standard set of script utilities
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source ${DIR}/.travis/base.sh

# ----

# Check that this is the main repository.
if [[ "${TRAVIS_REPO_SLUG}" != accordproject* ]]; then
    _exit "Skipping deploy; wrong repository slug." 0
fi

# Check that this is the main repository.
if [[ "${TRAVIS_BRANCH}" != master ]]; then
    _exit "Skipping deploy; Not a master branch build." 0
fi

## Start of release process

# Set the NPM access token we will use to publish.
npm config set registry https://registry.npmjs.org/
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Set the GitHub deploy key we will use to publish.
set-up-ssh --key "$encrypted_50be70a02dcf_key" \
           --iv "$encrypted_50be70a02dcf_iv" \
           --path-encrypted-key ".travis/github_deploy_key.enc"

# Change from HTTPS to SSH.
./.travis/fix_github_https_repo.sh

# Test the GitHub deploy key.
git ls-remote

# Determine the details of the suffixes NPM tags
if [[ "${BUILD_RELEASE}" == "unstable" ]]; then

    # Set the prerelease version.
    npm run pkgstamp
   
    TAG="unstable"
elif  [[ "${BUILD_RELEASE}" == "stable" ]]; then
    TAG="latest"
else 
    _exit "Unknown build focus" 1 
fi

## Stable releases only; both latest and next then clean up git, and bump version number
if [[ "${BUILD_RELEASE}" = "stable" ]]; then

    # Configure the Git repository and clean any untracked and unignored build files.
    git config user.name "${GH_USER_NAME}"
    git config user.email "${GH_USER_EMAIL}"
    git checkout -b master
    git reset --hard
    git clean -d -f

    # Bump the version number.
    npm run pkgbump
    export NEW_VERSION=$(node -e "console.log(require('${DIR}/package.json').version)")

    # Add the version number changes and push them to Git.
    git add .
    git commit -m "Automatic version bump to ${NEW_VERSION}"
    git push origin master

fi

# Hold onto the version number
export VERSION=$(node -e "console.log(require('${DIR}/package.json').version)")

# Publish with tag
echo "Pushing with tag ${TAG}"
lerna exec -- npm publish --tag="${TAG}" 2>&1

# Check that all required modules have been published to npm and are retrievable
for j in ${NPM_MODULES}; do
    # check the next in the list
    while ! npm view ${j}@${VERSION} | grep dist-tags > /dev/null 2>&1; do
        sleep 10
    done
done



_exit "All complete" 0

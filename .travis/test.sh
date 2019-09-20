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

if [ $TRAVIS_OS_NAME = 'windows' ]; then 
    npm run test:cli; 
else 
    npm run test;
fi 

_exit "All complete" 0
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

## this is a script soley for inclusion in the main build scripts.
## Common functions that are executed both all types of builds

ME=`basename "$0"`
echo "-->-- Starting ${ME}"
echo "--I-- ${TRAVIS_TAG} ${TRAVIS_BRANCH}"

function _exit(){
    printf "%s Exiting %s because %s exit code:%s\n" "--<--" "${ME}" "$1" "$2"   
    exit $2
}

function _abortBuild(){
    echo "ABORT_BUILD=true" > ${DIR}/build.cfg
    echo "ABORT_CODE=$1" >> ${DIR}/build.cfg
    echo "BUILD_FOCUS=${BUILD_FOCUS}" >> ${DIR}/build.cfg
    echo "BUILD_RELEASE=${BUILD_RELEASE}" >> ${DIR}/build.cfg
}

#check to see if the build.cfg file (that holds state between scripts)
if [ ! -f ${DIR}/build.cfg ]; then

    echo "ABORT_BUILD=false" > ${DIR}/build.cfg
    echo "ABORT_CODE=0" >> ${DIR}/build.cfg
    ## determine the build type here
    if [ -z "${TRAVIS_TAG}" ]; then
        BUILD_RELEASE="unstable"
        BUILD_FOCUS="latest"
    else
        BUILD_RELEASE="stable"
        BUILD_FOCUS="latest"
    fi

    echo "BUILD_FOCUS=${BUILD_FOCUS}" >> ${DIR}/build.cfg
    echo "BUILD_RELEASE=${BUILD_RELEASE}" >> ${DIR}/build.cfg
fi

source ${DIR}/build.cfg

echo "--I-- Build focus is ${BUILD_FOCUS}"
echo "--I-- Build release is ${BUILD_RELEASE}"

if [ "${ABORT_BUILD}" == "true" ]; then
  _exit "exiting early from" ${ABORT_CODE}
fi
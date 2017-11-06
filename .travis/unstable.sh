# Exit on first error, print all commands.
set -ev
date
echo "Tag is " $1
echo "NPM_TOKEN " ${NPM_TOKEN}

# Set the NPM access token we will use to publish.
npm config set registry https://registry.npmjs.org/
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

lerna publish --yes --canary --conventional-commits -m "chore(release): publish %s" --skip-npm
echo "Published to npm using lerna."

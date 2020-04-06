# Cicero Development Guide

## ❗ Accord Project Development Guide ❗
We'd love for you to help develop improvements to Cicero technology! Please refer to the [Accord Project Development guidelines][apdev] we'd like you to follow.

## Cicero Specific Information

### Development Setup

#### Building Cicero

To build Cicero, you clone the source code repository and use lerna to build:

```shell
# Clone your Github repository:
git clone https://github.com/<GITHUB_USERNAME>/cicero.git

# Go to the Cicero directory:
cd cicero

# Add the main Cicero repository as an upstream remote to your repository:
git remote add upstream "https://github.com/accordproject/cicero.git"

# Install node.js dependencies:
npm install -g lerna
lerna bootstrap
```

[apdev]: https://github.com/accordproject/techdocs/blob/master/DEVELOPERS.md

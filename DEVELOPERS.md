# Template Archive Development Guide

## ❗ Accord Project Development Guide ❗
We'd love for you to help develop improvements to Template Archive technology! Please refer to the [Accord Project Development guidelines][apdev] we'd like you to follow.

## Template Archive Specific Information

### Development Setup

#### Building Template Archive

To build Template Archive, you clone the source code repository and use npm to build:

```shell
# Clone your Github repository:
git clone https://github.com/<GITHUB_USERNAME>/template-archive.git

# Go to the Template Archive directory:
cd template-archive

# Add the main Template Archive repository as an upstream remote to your repository:
git remote add upstream "https://github.com/accordproject/template-archive.git"
```

**Note:** Template Archive no longer uses `lerna bootstrap`, since `lerna bootstrap` was deprecated at lerne version 7.x.  Now `npm install` automatically resolves packages defined within the "Workspaces" definition inside `package.json`.

[apdev]: https://github.com/accordproject/techdocs/blob/master/DEVELOPERS.md

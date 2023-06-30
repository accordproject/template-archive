# Build-time external models scripts

Those scripts are used to download CTO models from Web resources during the build process

## How to use

You should only have to change: ./scripts/externals/models.json which is a JSON object with a `target` field for the directory where downloaded models will be written, and a `models` field which is an array of entries.

Each model entry in that array should look as follows:
```
{ "name": "commonMarkModel",
  "namespace" : "org.accordproject.commonmark",
  "from": "https://models.accordproject.org/markdown/commonmark.cto",
  "js" : "packages/markdown-cicero/src/externalModels" },
```
where `name` is the name of the `.js` file (and variables inside it) being created, `namespace` is the namespace for that model, and `from` it the URL where the model can be obtained from.

The `js` field is optional. If present it will create a Node.js module which exports the namespace prefix and content of the model as a string.

Running `node ./scripts/external/getExternalModels.js` downloads the models in the `target` directory and generates the corresponding JavaScript files.

## How to cleanup

Running `node ./scripts/external/cleanExternalModels.js` removes all the generated files.


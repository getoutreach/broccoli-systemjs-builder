# Broccoli SystemJS Builder

The broccoli-systemjs-builder plugin providers a thin wrapper around the SystemJS Builder.

Unlike [broccoli-system-builder](https://github.com/Bajix/broccoli-system-builder), this project aims to efficiently incrementally recompile.

## Installation

```bash
npm install broccoli-systemjs-builder --save-dev
```

## Usage

```js
var SystemBuilder = require('broccoli-systemjs-builder');

var outputNode = new SystemJSBuilder(inputNode, baseURL, configPaths, fn);
```

* **`inputNode`**: Input node for System Builder.

* **`baseURL`**: Relative path of the base JSPM folder.

* **`configPaths`**: Array of systemjs configuration files.

* **`fn`**: Callback function to setup SystemJS Build. See [here](https://github.com/systemjs/builder) for usage details.

### Example

```js
var outputNode = new SystemJSBuilder(inputNode, '/', ['system.config.js'], function( builder ) {

  builder.config({
    meta: {
      'resource/to/ignore.js': {
        build: false
      }
    }
  });

  return builder.buildStatic('myModule.js', 'outfile.js');
});
```

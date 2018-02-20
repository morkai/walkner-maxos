# Walkner MAXOS

## Requirements

### node.js

  * __Version__: 8
  * __Website__: https://nodejs.org/
  * __Download__: https://nodejs.org/en/download/

### MongoDB

  * __Version__: 3.4
  * __Website__: https://www.mongodb.org/
  * __Download__: https://www.mongodb.com/download-center

## Installation

Clone the repository:

```
git clone git://github.com/morkai/walkner-maxos.git
```

or [download](https://github.com/morkai/walkner-maxos/zipball/master)
and extract it.

Go to the project's directory and install the dependencies:

```
cd walkner-maxos/
npm install -g grunt-cli
npm install
```

## Configuration

1. Create your own config directory (e.g. `walkner-maxos/config/development/`).
2. Create a JS file for each server process (`maxos-*.js` files) you want to run.
3. In each `walkner-maxos/config/development/maxos-*.js` file require and export the corresponding file from
   the `walkner-maxos/config/` directory.
4. Override whatever you want in your custom config files.

## Starting

```
node backend/main.js <path to the server process config>
```

For example:

```
cd walkner-maxos
node backend/main.js ../config/maxos-frontend.js
```

## License

This project is released under the [CC BY-NC-SA 4.0](https://raw.github.com/morkai/walkner-maxos/master/license.md).

Copyright (c) 2017, Łukasz Walukiewicz (lukasz@miracle.systems)

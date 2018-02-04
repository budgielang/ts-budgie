# TS-GLS - TypeScript to GLS compiler

[![Build Status](https://travis-ci.org/general-language-syntax/TS-GLS.svg?)](https://travis-ci.org/general-language-syntax/TS-GLS)
[![NPM version](https://badge.fury.io/js/ts-gls.svg)](http://badge.fury.io/js/ts-gls)
[![Greenkeeper badge](https://badges.greenkeeper.io/general-language-syntax/TS-GLS.svg)](https://greenkeeper.io/)

Compiles TypeScript code to General Language Syntax (GLS).


## Usage

*Coming soon!*


## Development

To build from scratch, install Node.js and run the following commands:

```
npm install
npm run verify
```

Check `package.json` for the full list of commands.
To set up source file compiling in watch mode, use `tsc -p . -w`.

### Tests

Integration and end-to-end tests are done using BDD.
Folders under `/test/integration` and `/test/end-to-end` will contain a `.ts` file with TypeScript source code along with an equivalent `.gls` file with the expected GLS compilation result.
These are verified during `npm run test test`.

You can run specific tests using their run task (`npm run test:run:integration` or `npm run test:run:end-to-end`).
Specify `--command`(s) to only run tests within groups that case-insensitive [minimatch](https://www.npmjs.com/package/minimatch) them (e.g. `npm run test:run:end-to-end --command *array* *list*`).

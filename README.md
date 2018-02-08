# TS-GLS - TypeScript to GLS compiler

[![Build Status](https://travis-ci.org/general-language-syntax/TS-GLS.svg?)](https://travis-ci.org/general-language-syntax/TS-GLS)
[![NPM version](https://badge.fury.io/js/ts-gls.svg)](http://badge.fury.io/js/ts-gls)
[![Greenkeeper badge](https://badges.greenkeeper.io/general-language-syntax/TS-GLS.svg)](https://greenkeeper.io/)

Compiles TypeScript code to General Language Syntax (GLS).

GLS is an abstract way to describe lines of code in real languages.
TypeScript is a gradually typed language, so a subset of well-typed TS code can generally be converted to GLS.

## Caveats

It's impossible to _accurately_ convert TS code to GLS.
Although large constructs such as classes and interfaces can be, there are edge cases around primitive literals not representable in TypeScript.

For example, TS-GLS has no way of knowing whether `age: number` is a GLS `float` or `int`:

```typescript
export class AgePrinter {
    public printAge(name: string, age: number): void {
        console.log(`${name} is ${age} year(s) old.`);
    }
}
```

The TS `string` type also can't be statically determined to be a GLS `char` or `string`.

Thus, TS-GLS will never be more than an experiment.
Only a completely strongly typed language with `int`s and `char`s, such as C# or Java, can truly be compiled to GLS.
TS-GLS can only get code most of the way there.

## Usage

You can use TS-GLS on the command-line with `gls-cli` or in code.

### CLI

```shell
gls --language Java --tsconfig ./tsconfig *.ts
```

See [`gls-cli`](https://github.com/general-language-syntax/gls-cli)

### Code

`createTransformer` creates a `Transformer` object that can transform source files to GLS.
It requires all files at construction so it can create a TypeScript program.

```typescript
import * as ts from "typescript";
import { createTransformer } from "ts-gls";

const sourceFile = ts.createSourceFile("_.ts", "let x = true;", ScriptTarget.Latest);
const transformer = createTransformer({
    sourceFiles: [sourceFile],
});

// ["variable : x boolean true"]
transformer.transformSourceFile(sourceFile)
```

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
Specify `--command`(s) to only run tests within groups that case-insensitive [minimatch](https://www.npmjs.com/package/minimatch) them (e.g. `npm run test:run:end-to-end -- --command *array* *list*`).

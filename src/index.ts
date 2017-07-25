import * as ts from "typescript";

function mount(sourceText: string, options: ts.CompilerOptions): void {
    // const program = ts.createProgram(fileNames, options);
    // const sourceFile = program.getSourceFile();
    const sourceFile = ts.createSourceFile("gls.ts", sourceText, ts.ScriptTarget.Latest);

    // sourceFile.
}

// compile(process.argv.slice(2), {
//     noEmitOnError: true, noImplicitAny: true,
//     target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
// });

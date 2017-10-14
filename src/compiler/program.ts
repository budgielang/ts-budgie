import { CompilerOptions, createProgram, Program, ScriptTarget, SourceFile } from "typescript";

import { StubCompilerHost } from "./stubCompilerHost";

const defaultOptions = {
    allowJs: false,
    // Maybe: declaration: true,
    lib: ["es5", "es2015.collection"]
};

export const createProgramForFiles = (sourceFiles: SourceFile[], options: CompilerOptions = defaultOptions) =>
    createProgram(
        sourceFiles.map((sourceFile) => sourceFile.fileName),
        options,
        new StubCompilerHost(options, sourceFiles));

export const createProgramForFile = (sourceFile: SourceFile, options?: CompilerOptions) =>
    createProgramForFiles([sourceFile], options);

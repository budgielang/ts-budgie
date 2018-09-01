import * as ts from "typescript";

import { InMemoryCompilerHost } from "./inMemoryCompilerHost";

const defaultOptions: ts.CompilerOptions = {
    allowJs: false,
    noLib: true,
};

export const createProgramForFiles = (sourceFiles: ts.SourceFile[], options: ts.CompilerOptions = defaultOptions): ts.Program =>
    ts.createProgram(sourceFiles.map((sourceFile) => sourceFile.fileName), options, new InMemoryCompilerHost(sourceFiles));

export const createProgramForFile = (sourceFile: ts.SourceFile, options?: ts.CompilerOptions): ts.Program =>
    createProgramForFiles([sourceFile], options);

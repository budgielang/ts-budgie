import * as ts from "typescript";

import { InMemoryCompilerHost } from "./inMemoryCompilerHost";
import { fullyNormalizeFilePath } from "./utils";

const defaultOptions: ts.CompilerOptions = {
    allowJs: false,
    noLib: true,
};

export const createProgramForFiles = (sourceFiles: ts.SourceFile[], options: ts.CompilerOptions = defaultOptions): ts.Program =>
    ts.createProgram(
        sourceFiles.map((sourceFile) => fullyNormalizeFilePath(sourceFile.fileName)),
        options,
        new InMemoryCompilerHost(sourceFiles),
    );

export const createProgramForFile = (sourceFile: ts.SourceFile, options?: ts.CompilerOptions): ts.Program =>
    createProgramForFiles([sourceFile], options);

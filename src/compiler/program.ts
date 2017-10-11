import { createProgram, Program, ScriptTarget, SourceFile } from "typescript";

import { StubCompilerHost } from "./stubCompilerHost";

export const createProgramForFiles = (sourceFiles: SourceFile[]) =>
    createProgram(
        sourceFiles.map((sourceFile) => sourceFile.fileName),
        {
            allowJs: false,
            lib: ["es5", "es2015.collection"]
        },
        new StubCompilerHost(sourceFiles));

export const createProgramForFile = (sourceFile: SourceFile) =>
    createProgramForFiles([sourceFile]);

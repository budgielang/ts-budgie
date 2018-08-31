import * as ts from "typescript";

import { createProgramForFile } from "../../../src/compiler/program";

export const mountSourceText = (sourceText: string) => {
    const sourceFile = ts.createSourceFile("input.ts", sourceText, ts.ScriptTarget.Latest);
    const typeChecker = createProgramForFile(sourceFile).getTypeChecker();

    return { sourceFile, typeChecker };
};

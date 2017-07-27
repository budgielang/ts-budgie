import { createSourceFile, Node, ScriptTarget } from "typescript";

import { createStubProgramForFile } from "../../../lib/compiler/program";

export const mountSourceText = (sourceText: string) => {
    const sourceFile = createSourceFile("input.ts", sourceText, ScriptTarget.Latest);
    const typeChecker = createStubProgramForFile(sourceFile).getTypeChecker();

    return { sourceFile, typeChecker };
};

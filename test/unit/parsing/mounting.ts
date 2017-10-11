import { createSourceFile, Node, ScriptTarget } from "typescript";

import { createProgramForFile } from "../../../lib/compiler/program";

export const mountSourceText = (sourceText: string) => {
    const sourceFile = createSourceFile("input.ts", sourceText, ScriptTarget.Latest);
    const typeChecker = createProgramForFile(sourceFile).getTypeChecker();

    return { sourceFile, typeChecker };
};

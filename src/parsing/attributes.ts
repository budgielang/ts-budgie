import { SourceFile, VariableDeclaration } from "typescript";

export const isVariableDeclarationMultiline = (node: VariableDeclaration, sourceFile: SourceFile) => {
    if (node.initializer === undefined) {
        return false;
    }

    return node.initializer.getText(sourceFile).indexOf("\n") !== -1;
};

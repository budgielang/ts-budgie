import { CommandNames } from "general-language-syntax";
import {
    Node, SourceFile, SyntaxKind, TypeChecker, VariableDeclaration
} from "typescript";
import * as ts from "typescript";

import { GlsLine } from "../glsLine";
import { getTypeAlias } from "./aliases";

export const isVariableDeclarationMultiline = (node: VariableDeclaration, sourceFile: SourceFile) => {
    if (node.initializer === undefined) {
        return false;
    }

    return node.initializer.getText(sourceFile).indexOf("\n") !== -1;
};

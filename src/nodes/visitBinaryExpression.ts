import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { BinaryExpression, SourceFile, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { operators } from "../parsing/aliases";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";

export const visitBinaryExpression = (node: BinaryExpression, sourceFile: SourceFile, typeChecker: TypeChecker) => {
    const operator = operators[node.operatorToken.kind];
    if (operator === undefined) {
        return undefined;
    }

    const value = node.left.getText(sourceFile);
    const item = node.right.getText(sourceFile);

    return [
        Transformation.fromNode(
            node,
            sourceFile,
            [
                new GlsLine(CommandNames.Operation, value, operator, item)
            ])
    ];
};

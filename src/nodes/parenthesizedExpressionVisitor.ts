import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { ParenthesizedExpression, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";
import { NodeVisitor } from "./visitor";

export class ParenthesizedExpressionVisitor extends NodeVisitor {
    public visit(node: ParenthesizedExpression, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const contents = this.recurseOnValue(node.expression, sourceFile, typeChecker);

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.Parenthesis, contents)
                ])
        ];
    }
}

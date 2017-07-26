import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { IfStatement, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";
import { visitNode, visitNodes } from "./visitNode";
import { NodeVisitor } from "./visitor";

export class IfStatementVisitor extends NodeVisitor {
    public visit(node: IfStatement, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const expression = this.recurseOnValue(node.expression, sourceFile, typeChecker);
        const body = visitNode(node.thenStatement, sourceFile, typeChecker);

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.IfStart, expression),
                    ...(body || []),
                    new GlsLine(CommandNames.IfEnd)
                ])
        ];
    }
}

import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { SourceFile, Statement, SyntaxKind, TypeChecker, WhileStatement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { visitNode, visitNodes } from "../visitNode";
import { NodeVisitor } from "../visitor";

export class WhileStatementVisitor extends NodeVisitor {
    public visit(node: WhileStatement, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const expression = this.recurseOnValue(node.expression, sourceFile, typeChecker);
        const transformations: Transformation[] = [];
        const { statement } = node;

        if (statement !== undefined) {
            const thenBody = visitNode(statement, sourceFile, typeChecker);
            if (thenBody !== undefined) {
                transformations.push(...thenBody);
            }
        }

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.WhileStart, expression),
                    ...transformations,
                    new GlsLine(CommandNames.WhileEnd)
                ])
        ];
    }
}

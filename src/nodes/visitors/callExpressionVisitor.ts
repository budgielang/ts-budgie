import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class CallExpressionVisitor extends NodeVisitor {
    public visit(node: ts.CallExpression) {
        if (node.expression.kind === ts.SyntaxKind.SuperKeyword) {
            return this.visitSuperConstructor(node);
        }

        return this.router.recurseIntoNode(node.expression);
    }

    private visitSuperConstructor(node: ts.CallExpression) {
        const args = this.router.recurseIntoValues(node.arguments);

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.SuperConstructor, ...args)])];
    }
}

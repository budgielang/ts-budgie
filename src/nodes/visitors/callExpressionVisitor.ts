import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
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

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.SuperConstructor, ...args)])];
    }
}

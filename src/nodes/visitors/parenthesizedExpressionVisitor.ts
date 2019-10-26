import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ParenthesizedExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ParenthesizedExpression) {
        const contents = this.router.recurseIntoValue(node.expression);

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Parenthesis, contents)])];
    }
}

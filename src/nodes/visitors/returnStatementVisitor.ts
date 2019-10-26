import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ReturnStatementVisitor extends NodeVisitor {
    public visit(node: ts.ReturnStatement) {
        const returnValues = this.getReturnValues(node.expression);

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Return, ...returnValues)])];
    }

    private getReturnValues(expression: ts.Expression | undefined) {
        if (expression === undefined) {
            return [];
        }

        return [this.router.recurseIntoValue(expression)];
    }
}

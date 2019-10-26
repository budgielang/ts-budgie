import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const throwStatementMustBeNewComplaint = "Budgie only supports throwing new exceptions.";

export class ThrowStatementVisitor extends NodeVisitor {
    public visit(node: ts.ThrowStatement) {
        const expression = node.expression;
        if (expression === undefined || !ts.isNewExpression(expression)) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedBudgieLine(throwStatementMustBeNewComplaint)])];
        }

        const args: (string | BudgieLine)[] = [new BudgieLine(CommandNames.Exception)];

        const message = this.getExceptionMessage(expression);
        if (message !== undefined) {
            args.push(message);
        }

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Throw, ...args)])];
    }

    private getExceptionMessage(node: ts.NewExpression): string | BudgieLine | undefined {
        if (node.arguments === undefined || node.arguments.length === 0) {
            return undefined;
        }

        return this.router.recurseIntoValue(node.arguments[0]);
    }
}

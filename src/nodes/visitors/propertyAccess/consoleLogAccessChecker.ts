import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../../output/budgieLine";
import { Transformation } from "../../../output/transformation";

import { PropertyAccessChecker } from "./propertyAccessChecker";

export class ConsoleLogAccessChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (
            node.parent === undefined ||
            !ts.isCallExpression(node.parent) ||
            node.expression.getText(this.sourceFile) !== "console" ||
            node.name.getText(this.sourceFile) !== "log"
        ) {
            return undefined;
        }

        const args = this.router.recurseIntoValues(node.parent.arguments);

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Print, ...args)])];
    }
}

import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../../output/budgieLine";
import { Transformation } from "../../../output/transformation";

import { PropertyAccessChecker } from "./propertyAccessChecker";

const allowedHasOwnPropertyReferences = new Set(["{}.hasOwnProperty", "Object.hasOwnProperty"]);

export class HasOwnPropertyAccessChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (
            node.parent === undefined ||
            !ts.isCallExpression(node.parent) ||
            !allowedHasOwnPropertyReferences.has(node.expression.getText(this.sourceFile)) ||
            node.name.getText(this.sourceFile) !== "call"
        ) {
            return undefined;
        }

        const args = this.router.recurseIntoValues(node.parent.arguments);

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.DictionaryContainsKey, ...args)])];
    }
}

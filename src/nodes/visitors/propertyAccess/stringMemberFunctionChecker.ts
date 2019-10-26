import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../../output/budgieLine";
import { Transformation } from "../../../output/transformation";

import { PropertyAccessChecker } from "./propertyAccessChecker";

const knownMethodPairs = new Map<string, string>([
    ["indexOf", CommandNames.StringIndexOf],
    ["substr", CommandNames.StringSubstringLength],
    ["substring", CommandNames.StringSubstringIndex],
    ["toLowerCase", CommandNames.StringCaseLower],
    ["toUpperCase", CommandNames.StringCaseUpper],
    ["trim", CommandNames.StringTrim],
]);

export class StringMemberFunctionChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined || !ts.isCallExpression(node.parent) || !this.isString(node.expression)) {
            return undefined;
        }

        const nativeMethodName = node.name.getText(this.sourceFile);
        const budgieMethodName = knownMethodPairs.get(nativeMethodName);
        if (budgieMethodName === undefined) {
            return undefined;
        }

        const args = this.router.recurseIntoValues(node.parent.arguments);

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(budgieMethodName, node.expression.getText(this.sourceFile), ...args),
            ]),
        ];
    }

    private isString(expression: ts.Expression) {
        return this.aliaser.getFriendlyTypeName(expression) === "string";
    }
}

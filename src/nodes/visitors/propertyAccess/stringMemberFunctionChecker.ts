import { CommandNames } from "general-language-syntax";
import { Expression, isCallExpression, PropertyAccessExpression } from "typescript";

import { UnsupportedComplaint } from "../../../output/complaint";
import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";
import { filterOutUnsupportedComplaint } from "../../../utils";
import { PropertyAccessChecker } from "./propertyAccessChecker";

interface IKnownMethodInfo {
    argsCount: number;
    name: string;
}

const knownMethodPairs = new Map<string, string>([
    ["substr", CommandNames.StringSubstringLength],
    ["substring", CommandNames.StringSubstringIndex],
    ["toLowerCase", CommandNames.StringCaseLower],
    ["toUpperCase", CommandNames.StringCaseUpper],
]);

export class StringMemberFunctionChecker extends PropertyAccessChecker {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined
            || !isCallExpression(node.parent)
            || !this.isString(node.expression)) {
            return undefined;
        }

        const nativeMethodName = node.name.getText(this.sourceFile);
        const glsMethodName = knownMethodPairs.get(nativeMethodName);
        if (glsMethodName === undefined) {
            return undefined;
        }

        const args = filterOutUnsupportedComplaint(
            node.parent.arguments
                .map((arg) => this.router.recurseIntoValue(arg)));
        if (args instanceof UnsupportedComplaint) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(glsMethodName, node.expression.getText(this.sourceFile), ...args)
                ])
        ];
    }

    private isString(expression: Expression) {
        return this.aliaser.getFriendlyTypeName(expression) === "string";
    }
}

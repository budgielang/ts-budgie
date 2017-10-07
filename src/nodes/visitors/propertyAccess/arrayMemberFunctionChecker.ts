import { CommandNames } from "general-language-syntax";
import { CallExpression, Expression, isCallExpression, PropertyAccessExpression } from "typescript";

import { UnsupportedComplaint } from "../../../output/complaint";
import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";
import { filterOutUnsupportedComplaint } from "../../../utils";
import { PropertyAccessChecker } from "./propertyAccessChecker";

interface IKnownMethodInfo {
    argsCount: number;
    name: string;
}

const knownMethodPairs = new Map<string, IKnownMethodInfo>([
    [
        "concat",
        {
            argsCount: 1,
            name: "list add list"
        }
    ],
    [
        "pop",
        {
            argsCount: 0,
            name: "list pop"
        }
    ],
    [
        "pop front",
        {
            argsCount: 0,
            name: "list unshift",
        }
    ],
    [
        "push",
        {
            argsCount: 1,
            name: "list push"
        }
    ],
]);

export class ArrayMemberFunctionChecker extends PropertyAccessChecker {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined
            || !isCallExpression(node.parent)
            || !this.isArray(node.expression)) {
            return undefined;
        }

        const nativeMethodName = node.name.getText(this.sourceFile);
        const glsMethodPairing = knownMethodPairs.get(nativeMethodName);
        if (glsMethodPairing === undefined || node.parent.arguments.length !== glsMethodPairing.argsCount) {
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
                    new GlsLine(glsMethodPairing.name, ...args)
                ])
        ];
    }

    private isArray(expression: Expression) {
        const symbol = this.typeChecker.getSymbolAtLocation(expression);
        if (symbol === undefined || symbol.declarations === undefined) {
            return false;
        }

        const [declaration] = symbol.declarations;
        const friendlyTypeName = this.aliaser.getFriendlyTypeName(declaration);
        if (friendlyTypeName === undefined || typeof friendlyTypeName === "string") {
            return false;
        }

        return friendlyTypeName.command === CommandNames.ListType;
    }
}

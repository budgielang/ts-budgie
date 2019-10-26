import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";

import { PropertyAccessChecker } from "./propertyAccessChecker";

export class StringLengthAccessChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (!this.isString(node.expression) || node.name.getText(this.sourceFile) !== "length") {
            return undefined;
        }

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new GlsLine(CommandNames.StringLength, node.expression.getText(this.sourceFile)),
            ]),
        ];
    }

    private isString(expression: ts.Expression) {
        return this.aliaser.getFriendlyTypeName(expression) === "string";
    }
}

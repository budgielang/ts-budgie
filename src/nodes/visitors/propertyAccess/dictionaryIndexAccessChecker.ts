import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";
import { wrapWithQuotes } from "../../../parsing/strings";
import { PropertyAccessChecker } from "./propertyAccessChecker";

export class DictionaryIndexAccessChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (!this.isDictionary(node.expression)) {
            return undefined;
        }

        const key = this.router.recurseIntoValue(node.expression);
        let value = this.router.recurseIntoValue(node.name);

        if (typeof value === "string") {
            value = wrapWithQuotes(value);
        }

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.DictionaryIndex, key, value)])];
    }

    private isDictionary(expression: ts.Expression) {
        const friendlyName = this.aliaser.getFriendlyTypeName(expression);
        return friendlyName instanceof GlsLine ? friendlyName.command === CommandNames.DictionaryType : false;
    }
}

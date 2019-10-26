import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

export class ArrayLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ArrayLiteralExpression) {
        const parsedElements = this.router.recurseIntoValues(node.elements);
        const typeParsed = this.getTypeParsed(node.elements, parsedElements);

        this.context.setTypeCoercion(new BudgieLine(CommandNames.ListType, typeParsed));

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine("list initialize", typeParsed, ...parsedElements)])];
    }

    private getType(elements: ReadonlyArray<ts.Expression>) {
        if (this.context.coercion instanceof BudgieLine) {
            return this.context.coercion.args[0];
        }

        if (elements.length === 0) {
            return "object";
        }

        return this.aliaser.getFriendlyTypeName(elements[0]);
    }

    private getTypeParsed(elements: ReadonlyArray<ts.Expression>, parsedElements: (string | BudgieLine)[]) {
        let typeRaw = this.getType(elements);

        if (typeof typeRaw === "string" && isNumericTypeName(typeRaw)) {
            typeRaw = getNumericTypeNameFromUsages(parsedElements);
        }

        if (typeRaw === undefined) {
            return createUnsupportedTypeBudgieLine();
        }

        return typeRaw;
    }
}

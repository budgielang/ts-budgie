import { CommandNames } from "general-language-syntax";
import { ArrayLiteralExpression, Expression } from "typescript";

import { GlsLine } from "../../glsLine";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ArrayLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ArrayLiteralExpression) {
        const { elements } = node;
        const parsedElements = node.elements
            .map((element) => this.router.recurseIntoValue(element));
        const typeParsed = this.getTypeParsed(elements, parsedElements);

        if (typeParsed === undefined) {
            return undefined;
        }

        this.context.setTypeCoercion(new GlsLine(CommandNames.ListType, typeParsed));

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ListInitialize, typeParsed, ...parsedElements)
                ])
        ];
    }

    private getType(elements: ReadonlyArray<Expression>) {
        if (this.context.coercion instanceof GlsLine) {
            return this.context.coercion.args[0];
        }

        if (elements.length === 0) {
            return "object";
        }

        return this.aliaser.getFriendlyTypeName(elements[0]);
    }

    private getTypeParsed(elements: ReadonlyArray<Expression>, parsedElements: (string | GlsLine)[]) {
        let typeRaw = this.getType(elements);

        if (typeof typeRaw === "string" && isNumericTypeName(typeRaw)) {
            typeRaw = getNumericTypeNameFromUsages(parsedElements);
        }

        return typeRaw;
    }
}

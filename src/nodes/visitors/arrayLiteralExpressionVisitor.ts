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

        this.context.setTypeCoercion(new GlsLine(CommandNames.ListType, typeParsed));

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ArrayInitialize, typeParsed, ...parsedElements)
                ])
        ];
    }

    private getType(elements: Expression[], parsedElements: (string | GlsLine)[]) {
        if (this.context.coercion instanceof GlsLine) {
            return this.context.coercion.args[0];
        }

        return "string"; // todo: actually do this
    }

    private getTypeParsed(elements: Expression[], parsedElements: (string | GlsLine)[]) {
        let typeRaw = this.getType(elements, parsedElements);

        if (typeof typeRaw === "string" && isNumericTypeName(typeRaw)) {
            typeRaw = getNumericTypeNameFromUsages(parsedElements);
        }

        return typeRaw;
    }
}

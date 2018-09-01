import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

export class ArrayLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ArrayLiteralExpression) {
        const parsedElements = this.router.recurseIntoValues(node.elements);
        const typeParsed = this.getTypeParsed(node.elements, parsedElements);

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

    private getType(elements: ReadonlyArray<ts.Expression>) {
        if (this.context.coercion instanceof GlsLine) {
            return this.context.coercion.args[0];
        }

        if (elements.length === 0) {
            return "object";
        }

        return this.aliaser.getFriendlyTypeName(elements[0]);
    }

    private getTypeParsed(elements: ReadonlyArray<ts.Expression>, parsedElements: (string | GlsLine)[]) {
        let typeRaw = this.getType(elements);

        if (typeof typeRaw === "string" && isNumericTypeName(typeRaw)) {
            typeRaw = getNumericTypeNameFromUsages(parsedElements);
        }

        if (typeRaw === undefined) {
            return createUnsupportedTypeGlsLine();
        }

        return typeRaw;
    }
}

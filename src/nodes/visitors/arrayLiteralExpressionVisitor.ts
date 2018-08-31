import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { filterOutUnsupportedComplaint } from "../../utils";
import { NodeVisitor } from "../visitor";

export class ArrayLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ArrayLiteralExpression) {
        const parsedElements = filterOutUnsupportedComplaint(
            node.elements.map(
                (element) => this.router.recurseIntoValue(element)));
        if (parsedElements instanceof UnsupportedComplaint) {
            return parsedElements;
        }

        const typeParsed = this.getTypeParsed(node.elements, parsedElements);
        if (typeParsed === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
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

        return typeRaw;
    }
}

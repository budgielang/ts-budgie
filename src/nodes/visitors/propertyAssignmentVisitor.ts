import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { wrapWithQuotes } from "../../parsing/strings";
import { NodeVisitor } from "../visitor";

export class PropertyAssignmentVisitor extends NodeVisitor {
    public visit(node: ts.PropertyAssignment) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    this.getTransformationContents(node),
                ])
        ];
    }

    private getTransformationContents(node: ts.PropertyAssignment) {
        const { coercion } = this.context;
        if (!(coercion instanceof GlsLine) || coercion.command !== CommandNames.DictionaryType) {
            return createUnsupportedTypeGlsLine();
        }

        const [keyType] = coercion.args;

        const key = this.router.recurseIntoValue(node.name);
        const keyWrapped = typeof key === "string" && keyType === "string"
            ? wrapWithQuotes(key)
            : key;

        const value = this.router.recurseIntoValue(node.initializer);
        const results: (string | GlsLine)[] = [keyWrapped, value];
        if (this.shouldAddComma(node)) {
            results.push(",");
        }

        return new GlsLine(CommandNames.DictionaryPair, ...results);
    }

    private shouldAddComma(node: ts.PropertyAssignment) {
        const parent = node.parent as ts.ObjectLiteralExpression | undefined;
        if (parent === undefined) {
            return false;
        }

        return node !== parent.properties[parent.properties.length - 1];
    }
}

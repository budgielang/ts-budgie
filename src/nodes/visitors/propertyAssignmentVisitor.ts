import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { wrapWithQuotes } from "../../parsing/strings";
import { NodeVisitor } from "../visitor";

export class PropertyAssignmentVisitor extends NodeVisitor {
    public visit(node: ts.PropertyAssignment) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getTransformationContents(node)])];
    }

    private getTransformationContents(node: ts.PropertyAssignment) {
        const { coercion } = this.context;
        if (!(coercion instanceof BudgieLine) || coercion.command !== CommandNames.DictionaryType) {
            return createUnsupportedTypeBudgieLine();
        }

        const [keyType] = coercion.args;

        const key = this.router.recurseIntoValue(node.name);
        const keyWrapped = typeof key === "string" && keyType === "string" ? wrapWithQuotes(key) : key;

        const value = this.router.recurseIntoValue(node.initializer);
        const results: (string | BudgieLine)[] = [keyWrapped, value];
        if (this.shouldAddComma(node)) {
            results.push(",");
        }

        return new BudgieLine(CommandNames.DictionaryPair, ...results);
    }

    private shouldAddComma(node: ts.PropertyAssignment) {
        const parent = node.parent as ts.ObjectLiteralExpression | undefined;
        if (parent === undefined) {
            return false;
        }

        return node !== parent.properties[parent.properties.length - 1];
    }
}

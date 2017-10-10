import { CommandNames, KeywordNames } from "general-language-syntax";
import { ObjectLiteralExpression, PropertyAssignment } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { wrapWithQuotes } from "../../parsing/strings";
import { NodeVisitor } from "../visitor";

export class PropertyAssignmentVisitor extends NodeVisitor {
    public visit(node: PropertyAssignment) {
        const { coercion } = this.context;
        if (!(coercion instanceof GlsLine) || coercion.command !== CommandNames.DictionaryType) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        const [keyType, valueType] = coercion.args;

        const key = this.router.recurseIntoValue(node.name);
        if (key instanceof UnsupportedComplaint) {
            return key;
        }

        const keyWrapped = typeof key === "string" && keyType === "string"
            ? wrapWithQuotes(key)
            : key;

        const value = this.router.recurseIntoValue(node.initializer);
        if (value instanceof UnsupportedComplaint) {
            return value;
        }

        const results: (string | GlsLine)[] = [keyWrapped, value];
        if (this.shouldAddComma(node)) {
            results.push(",");
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.DictionaryPair, ...results)
                ])
        ];
    }

    private shouldAddComma(node: PropertyAssignment) {
        const parent = node.parent as ObjectLiteralExpression | undefined;
        if (parent === undefined) {
            return false;
        }

        return node !== parent.properties[parent.properties.length - 1];
    }
}

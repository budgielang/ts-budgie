import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class TemplateExpressionVisitor extends NodeVisitor {
    public visit(node: ts.TemplateExpression) {
        const args: (string | GlsLine)[] = [];
        let format = node.head.text;

        for (let i = 0; i < node.templateSpans.length; i += 1) {
            const templateSpan = node.templateSpans[i];
            const value = this.router.recurseIntoValue(templateSpan.expression);
            const type = this.aliaser.getFriendlyTypeName(templateSpan.expression);

            args.push(value, type === undefined ? createUnsupportedTypeGlsLine() : type);

            format += `{${i}}${templateSpan.literal.text}`;
        }

        format = `"${format}"`;

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.StringFormat, format, ...args)])];
    }
}

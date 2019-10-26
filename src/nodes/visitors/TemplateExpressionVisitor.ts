import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class TemplateExpressionVisitor extends NodeVisitor {
    public visit(node: ts.TemplateExpression) {
        const args: (string | BudgieLine)[] = [];
        let format = node.head.text;

        for (let i = 0; i < node.templateSpans.length; i += 1) {
            const templateSpan = node.templateSpans[i];
            const value = this.router.recurseIntoValue(templateSpan.expression);
            const type = this.aliaser.getFriendlyTypeName(templateSpan.expression);

            args.push(value, type === undefined ? createUnsupportedTypeBudgieLine() : type);

            format += `{${i}}${templateSpan.literal.text}`;
        }

        format = `"${format}"`;

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.StringFormat, format, ...args)])];
    }
}

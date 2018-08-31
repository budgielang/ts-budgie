import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ParenthesizedExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ParenthesizedExpression) {
        const contents = this.router.recurseIntoValue(node.expression);
        if (contents instanceof UnsupportedComplaint) {
            return contents;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Parenthesis, contents)
                ])
        ];
    }
}

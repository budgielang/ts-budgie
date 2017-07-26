import { CommandNames } from "general-language-syntax";
import { ParenthesizedExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "./../visitor";

export class ParenthesizedExpressionVisitor extends NodeVisitor {
    public visit(node: ParenthesizedExpression) {
        const contents = this.router.recurseIntoValue(node.expression);

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

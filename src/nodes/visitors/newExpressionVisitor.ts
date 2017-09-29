import { CommandNames } from "general-language-syntax";
import { Expression, NewExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class NewExpressionVisitor extends NodeVisitor {
    public visit(node: NewExpression) {
        const newTypes = this.getReturnValues(node.expression);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.New, ...newTypes),
                ])
        ];
    }

    private getReturnValues(expression: Expression | undefined): (string | GlsLine)[] {
        return expression === undefined
            ? []
            : [this.router.recurseIntoValue(expression)];
    }
}

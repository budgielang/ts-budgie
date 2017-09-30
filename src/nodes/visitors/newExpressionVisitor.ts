import { CommandNames } from "general-language-syntax";
import { Expression, NewExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class NewExpressionVisitor extends NodeVisitor {
    public visit(node: NewExpression) {
        const newTypes = this.getNewTypes(node.expression);
        if (newTypes.length !== 1) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.New, newTypes[0]),
                ])
        ];
    }

    private getNewTypes(expression: Expression | undefined): (string | GlsLine)[] {
        if (expression === undefined) {
            return [];
        }

        const returnValue = this.router.recurseIntoValue(expression);
        return returnValue === undefined
            ? []
            : [returnValue];
    }
}

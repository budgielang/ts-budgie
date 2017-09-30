import { CommandNames } from "general-language-syntax";
import { Expression, ReturnStatement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ReturnStatementVisitor extends NodeVisitor {
    public visit(node: ReturnStatement) {
        const returnValues = this.getReturnValues(node.expression);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Return, ...returnValues),
                ])
        ];
    }

    private getReturnValues(expression: Expression | undefined) {
        if (expression === undefined) {
            return [];
        }

        const value = this.router.recurseIntoValue(expression);

        return value === undefined
            ? []
            : [value];
    }
}
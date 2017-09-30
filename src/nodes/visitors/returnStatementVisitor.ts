import { CommandNames } from "general-language-syntax";
import { Expression, ReturnStatement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ReturnStatementVisitor extends NodeVisitor {
    public visit(node: ReturnStatement) {
        const returnValue = this.getReturnValues(node.expression);
        if (returnValue === undefined) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Return, returnValue),
                ])
        ];
    }

    private getReturnValues(expression: Expression | undefined) {
        return expression === undefined
            ? undefined
            : this.router.recurseIntoValue(expression);
    }
}

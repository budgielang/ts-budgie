import { CommandNames } from "general-language-syntax";
import { WhileStatement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class WhileStatementVisitor extends NodeVisitor {
    public visit(node: WhileStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        const transformations: Transformation[] = [];
        const { statement } = node;

        if (statement !== undefined) {
            const thenBody = this.router.recurseIntoNode(statement);
            if (thenBody !== undefined) {
                transformations.push(...thenBody);
            }
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.WhileStart, expression),
                    ...transformations,
                    new GlsLine(CommandNames.WhileEnd)
                ])
        ];
    }
}

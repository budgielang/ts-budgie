import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class WhileStatementVisitor extends NodeVisitor {
    public visit(node: ts.WhileStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        const transformations: Transformation[] = [];
        const { statement } = node;
        const thenBody = this.router.recurseIntoNode(statement);

        transformations.push(...thenBody);

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(CommandNames.WhileStart, expression),
                ...transformations,
                new BudgieLine(CommandNames.WhileEnd),
            ]),
        ];
    }
}

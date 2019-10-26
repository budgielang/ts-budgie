import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class IfStatementVisitor extends NodeVisitor {
    public visit(node: ts.IfStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        const { elseStatement, thenStatement } = node;
        const thenBody = this.router.recurseIntoNode(thenStatement);
        const transformations: Transformation[] = [...thenBody];

        if (elseStatement !== undefined) {
            transformations.push(...this.replaceWithElseCommands(elseStatement, this.router.recurseIntoNode(elseStatement)));
        }

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(CommandNames.IfStart, expression),
                ...transformations,
                new BudgieLine(CommandNames.IfEnd),
            ]),
        ];
    }

    private replaceWithElseCommands(elseStatement: ts.Statement, transformations: Transformation[]) {
        // If there are no commands, just end with an else command
        if (transformations.length === 0) {
            return [Transformation.fromNode(elseStatement, this.sourceFile, [new BudgieLine(CommandNames.ElseStart)])];
        }

        // 'else if' commands are still stored as IfStatement nodes under the parent's elseStatment
        const starter = transformations[0].output[0] as BudgieLine;
        if (starter.command === CommandNames.IfStart) {
            transformations[0].output[0] = new BudgieLine(CommandNames.ElseIfStart, ...starter.args);
        }

        // Removes any now-unnecessary 'if end' command
        transformations[0].output.pop();

        return transformations;
    }
}

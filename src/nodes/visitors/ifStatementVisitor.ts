import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class IfStatementVisitor extends NodeVisitor {
    public visit(node: ts.IfStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        if (expression instanceof UnsupportedComplaint) {
            return expression;
        }

        const { elseStatement, thenStatement } = node;
        const thenBody = this.router.recurseIntoNode(thenStatement);
        if (thenBody instanceof UnsupportedComplaint) {
            return thenBody;
        }

        const transformations: Transformation[] = [...thenBody];

        if (elseStatement !== undefined) {
            const elseBody = this.router.recurseIntoNode(elseStatement);
            if (elseBody instanceof UnsupportedComplaint) {
                return elseBody;
            }

            transformations.push(...this.replaceWithElseCommands(elseStatement, elseBody));
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.IfStart, expression),
                    ...transformations,
                    new GlsLine(CommandNames.IfEnd)
                ])
        ];
    }

    private replaceWithElseCommands(elseStatement: ts.Statement, transformations: Transformation[]) {
        // If there are no commands, just end with an else command
        if (transformations.length === 0) {
            return [
                Transformation.fromNode(
                    elseStatement,
                    this.sourceFile,
                    [
                        new GlsLine(CommandNames.ElseStart),
                    ])
            ];
        }

        // 'else if' commands are still stored as IfStatement nodes under the parent's elseStatment
        const starter = transformations[0].output[0] as GlsLine;
        if (starter.command === CommandNames.IfStart) {
            transformations[0].output[0] = new GlsLine(CommandNames.ElseIfStart, ...starter.args);
        }

        // Removes any now-unnecessary 'if end' command
        transformations[0].output.pop();

        return transformations;
    }
}

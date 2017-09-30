import { CommandNames } from "general-language-syntax";
import { IfStatement, SourceFile, Statement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class IfStatementVisitor extends NodeVisitor {
    public visit(node: IfStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        if (expression === undefined) {
            return undefined;
        }

        const transformations: Transformation[] = [];
        const { elseStatement, thenStatement } = node;

        const thenBody = this.router.recurseIntoNode(thenStatement);
        if (thenBody !== undefined) {
            transformations.push(...thenBody);
        }

        if (elseStatement !== undefined) {
            const elseBody = this.router.recurseIntoNode(elseStatement);
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

    private replaceWithElseCommands(elseStatement: Statement, transformations: Transformation[] | undefined) {
        // If there are no commands, just end with an else command
        if (transformations === undefined || transformations.length === 0) {
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

import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { IfStatement, SourceFile, Statement, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { visitNode, visitNodes } from "../visitNode";
import { NodeVisitor } from "../visitor";

const replaceWithElseCommands = (elseStatement: Statement, sourceFile: SourceFile, transformations: Transformation[] | undefined) => {
    // If there are no commands, just end with an else command
    if (transformations === undefined || transformations.length === 0) {
        return [
            Transformation.fromNode(
                elseStatement,
                sourceFile,
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
};

export class IfStatementVisitor extends NodeVisitor {
    public visit(node: IfStatement, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const expression = this.recurseOnValue(node.expression, sourceFile, typeChecker);
        const transformations: Transformation[] = [];
        const { elseStatement, thenStatement } = node;

        if (thenStatement !== undefined) {
            const thenBody = visitNode(thenStatement, sourceFile, typeChecker);
            if (thenBody !== undefined) {
                transformations.push(...thenBody);
            }
        }

        if (elseStatement !== undefined) {
            const elseBody = visitNode(elseStatement, sourceFile, typeChecker);
            transformations.push(...replaceWithElseCommands(elseStatement, sourceFile, elseBody));
        }

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.IfStart, expression),
                    ...transformations,
                    new GlsLine(CommandNames.IfEnd)
                ])
        ];
    }
}

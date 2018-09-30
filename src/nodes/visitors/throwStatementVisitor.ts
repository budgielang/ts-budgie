import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const throwStatementMustBeNewComplaint = "GLS only supports throwing new exceptions.";

export class ThrowStatementVisitor extends NodeVisitor {
    public visit(node: ts.ThrowStatement) {
        const expression = node.expression;
        if (expression === undefined || !ts.isNewExpression(expression)) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedGlsLine(throwStatementMustBeNewComplaint)])];
        }

        const args: (string | GlsLine)[] = [new GlsLine(CommandNames.Exception)];

        const message = this.getExceptionMessage(expression);
        if (message !== undefined) {
            args.push(message);
        }

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.Throw, ...args)])];
    }

    private getExceptionMessage(node: ts.NewExpression): string | GlsLine | undefined {
        if (node.arguments === undefined || node.arguments.length === 0) {
            return undefined;
        }

        return this.router.recurseIntoValue(node.arguments[0]);
    }
}

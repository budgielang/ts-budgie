import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class NewExpressionVisitor extends NodeVisitor {
    public visit(node: ts.NewExpression) {
        const newTypes = this.getNewTypes(node.expression);
        const newArgs = this.collectNewArgs(node.arguments);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.New, newTypes[0], ...newArgs),
                ])
        ];
    }

    private getNewTypes(expression: ts.Expression | undefined): (string | GlsLine)[] {
        if (expression === undefined) {
            return [];
        }

        return [
            this.router.recurseIntoValue(expression),
        ];
    }

    private collectNewArgs(argsList: ts.NodeArray<ts.Expression> | undefined): (string | GlsLine)[] {
        const args: (string | GlsLine)[] = [];
        if (argsList === undefined) {
            return args;
        }

        for (const arg of argsList) {
            const transformed = this.router.recurseIntoNode(arg);
            const argOutput = transformed[0].output[0];
            if (!(argOutput instanceof Transformation)) {
                args.push(argOutput);
            }
        }

        return args;
    }
}

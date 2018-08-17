import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class NewExpressionVisitor extends NodeVisitor {
    public visit(node: ts.NewExpression) {
        const newTypes = this.getNewTypes(node.expression);
        if (newTypes instanceof UnsupportedComplaint) {
            return newTypes;
        }

        const newArgs = this.collectNewArgs(node.arguments);
        if (newArgs instanceof UnsupportedComplaint) {
            return newArgs;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.New, newTypes[0], ...newArgs),
                ])
        ];
    }

    private getNewTypes(expression: ts.Expression | undefined): (string | GlsLine)[] | UnsupportedComplaint {
        if (expression === undefined) {
            return [];
        }

        const returnValue = this.router.recurseIntoValue(expression);
        if (returnValue instanceof UnsupportedComplaint) {
            return returnValue;
        }

        return [returnValue];
    }

    private collectNewArgs(argsList: ts.NodeArray<ts.Expression> | undefined): (string | GlsLine)[] | UnsupportedComplaint {
        const args: (string | GlsLine)[] = [];
        if (argsList === undefined) {
            return args;
        }

        for (const arg of argsList) {
            const transformed = this.router.recurseIntoNode(arg);
            if (transformed instanceof UnsupportedComplaint) {
                return transformed;
            }

            const argOutput = transformed[0].output[0];
            if (!(argOutput instanceof Transformation)) {
                args.push(argOutput);
            }
        }

        return args;
    }
}

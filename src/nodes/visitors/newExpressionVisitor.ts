import { CommandNames } from "general-language-syntax";
import { Expression, NewExpression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class NewExpressionVisitor extends NodeVisitor {
    public visit(node: NewExpression) {
        const newTypes = this.getNewTypes(node.expression);
        if (newTypes instanceof UnsupportedComplaint) {
            return newTypes;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.New, newTypes[0]),
                ])
        ];
    }

    private getNewTypes(expression: Expression | undefined): (string | GlsLine)[] | UnsupportedComplaint {
        if (expression === undefined) {
            return [];
        }

        const returnValue = this.router.recurseIntoValue(expression);
        if (returnValue instanceof UnsupportedComplaint) {
            return returnValue;
        }

        return [returnValue];
    }
}

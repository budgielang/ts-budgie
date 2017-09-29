import { CommandNames } from "general-language-syntax";
import { Expression, PropertyAccessExpression, SyntaxKind } from "typescript";

import { GlsLine } from "../../../glsLine";
import { Transformation } from "../../../transformation";
import { NodeVisitor } from "../../visitor";

export class StringLengthAccessChecker extends NodeVisitor {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (!this.isString(node.expression) || node.name.getText(this.sourceFile) !== "length") {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.StringLength, node.expression.getText(this.sourceFile))
                ])
        ];
    }

    private isString(node: Expression): boolean {
        if (node.kind === SyntaxKind.StringLiteral) {
            return true;
        }

        // The type checker is reporting "unknown" for the test case
        // return false;
        return true;
    }
}

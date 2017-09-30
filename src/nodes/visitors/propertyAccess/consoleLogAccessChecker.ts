import { CommandNames } from "general-language-syntax";
import { CallExpression, isCallExpression, PropertyAccessExpression } from "typescript";

import { GlsLine } from "../../../glsLine";
import { Transformation } from "../../../transformation";
import { filterOutUndefined } from "../../../utils";
import { NodeVisitor } from "../../visitor";

export class ConsoleLogAccessChecker extends NodeVisitor {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined
            || !isCallExpression(node.parent)
            || node.expression.getText(this.sourceFile) !== "console"
            || node.name.getText(this.sourceFile) !== "log") {
            return undefined;
        }

        const args = filterOutUndefined(
            node.parent.arguments
                .map((arg) => this.router.recurseIntoValue(arg)));
        if (args === undefined) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Print, ...args)
                ])
        ];
    }
}

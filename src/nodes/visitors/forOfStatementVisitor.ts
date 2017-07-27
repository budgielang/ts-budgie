import { CommandNames } from "general-language-syntax";
import { Expression, ForInitializer, ForOfStatement, VariableDeclaration } from "typescript";

import { isExpression } from "tsutils";
import { GlsLine } from "../../glsLine";
import { getListValueType } from "../../parsing/lists";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ForOfStatementVisitor extends NodeVisitor {
    public visit(node: ForOfStatement) {
        const body = this.router.recurseIntoNode(node.statement) || [];
        const container = this.router.recurseIntoValue(node.expression);
        const valueType = getListValueType(this.aliaser.getFriendlyTypeNameForNode(node.expression));
        const value = this.getContainer(node.initializer);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ForEachStart, container, valueType, value),
                    ...body,
                    new GlsLine(CommandNames.ForEachEnd)
                ])
        ];
    }

    private getContainer(initializer: ForInitializer) {
        if (isExpression(initializer)) {
            return initializer.getText(this.sourceFile);
        }

        return initializer.declarations[0].getText(this.sourceFile);
    }
}

import { CommandNames } from "budgie";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { getListValueType } from "../../parsing/lists";
import { NodeVisitor } from "../visitor";

export class ForOfStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForOfStatement) {
        return [Transformation.fromNode(node, this.sourceFile, this.getTransformationContents(node))];
    }

    private getTransformationContents(node: ts.ForOfStatement) {
        const expressionType = this.aliaser.getFriendlyTypeName(node.expression);
        if (expressionType === undefined) {
            return [createUnsupportedTypeBudgieLine()];
        }

        const bodyNodes = this.router.recurseIntoNode(node.statement);
        const container = this.router.recurseIntoValue(node.expression);
        const valueType = getListValueType(expressionType);
        const value = this.getContainer(node.initializer);

        return [
            new BudgieLine(CommandNames.ForEachStart, container, valueType, value),
            ...bodyNodes,
            new BudgieLine(CommandNames.ForEachEnd),
        ];
    }

    private getContainer(initializer: ts.ForInitializer) {
        if (tsutils.isExpression(initializer)) {
            return initializer.getText(this.sourceFile);
        }

        return initializer.declarations[0].getText(this.sourceFile);
    }
}

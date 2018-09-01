import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import * as tsutils from "tsutils";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { getListValueType } from "../../parsing/lists";
import { NodeVisitor } from "../visitor";

export class ForOfStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForOfStatement) {
        const bodyNodes = this.router.recurseIntoNode(node.statement);
        const container = this.router.recurseIntoValue(node.expression);
        const expressionType = this.router.recurseIntoValue(node.expression);
        const valueType = getListValueType(expressionType);
        const value = this.getContainer(node.initializer);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ForEachStart, container, valueType, value),
                    ...bodyNodes,
                    new GlsLine(CommandNames.ForEachEnd)
                ])
        ];
    }

    private getContainer(initializer: ts.ForInitializer) {
        if (tsutils.isExpression(initializer)) {
            return initializer.getText(this.sourceFile);
        }

        return initializer.declarations[0].getText(this.sourceFile);
    }
}

import { CommandNames } from "general-language-syntax";
import { ForInitializer, ForOfStatement } from "typescript";

import { isExpression } from "tsutils";
import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { getListValueType } from "../../parsing/lists";
import { getNumericTypeNameFromUsages, isNumericTypeName } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

export class ForOfStatementVisitor extends NodeVisitor {
    public visit(node: ForOfStatement) {
        const bodyNodes = this.router.recurseIntoNode(node.statement);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        const container = this.router.recurseIntoValue(node.expression);
        if (container instanceof UnsupportedComplaint) {
            return container;
        }

        const expressionType = this.aliaser.getFriendlyTypeName(node.expression);
        if (expressionType === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

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

    private getContainer(initializer: ForInitializer) {
        if (isExpression(initializer)) {
            return initializer.getText(this.sourceFile);
        }

        return initializer.declarations[0].getText(this.sourceFile);
    }
}

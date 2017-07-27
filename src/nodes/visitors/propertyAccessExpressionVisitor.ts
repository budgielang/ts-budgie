import { CommandNames } from "general-language-syntax";
import { PropertyAccessExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";
import { PropertyAccessChecker } from "./propertyAccessChecks/propertyAccessChecker";
import { StringLengthAccessChecker } from "./propertyAccessChecks/stringLengthAccessChecker";

export class PropertyAccessExpressionVisitor extends NodeVisitor {
    private readonly checkers: PropertyAccessChecker[] = [
        new StringLengthAccessChecker(this.sourceFile)
    ];

    public visit(node: PropertyAccessExpression) {
        const { expression, name } = node;
        const expressionAlias = this.aliaser.getFriendlyTypeNameForNode(expression);
        const nameAlias = this.aliaser.getFriendlyTypeNameForNode(name);

        for (const checker of this.checkers) {
            const checkedResult = checker.attemptVisit({
                expression, expressionAlias, name, nameAlias, node
            });

            if (checkedResult !== undefined) {
                return [
                    Transformation.fromNode(
                        node,
                        this.sourceFile,
                        [
                            checkedResult
                        ])
                ];
            }
        }

        return undefined;
    }
}

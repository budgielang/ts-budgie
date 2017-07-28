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

        for (const checker of this.checkers) {
            const checkedResult = checker.attemptVisit({ expression, name, node });

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

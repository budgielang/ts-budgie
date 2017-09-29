import { CommandNames } from "general-language-syntax";
import { PropertyAccessExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";
import { ConsoleLogAccessChecker } from "./propertyAccess/consoleLogAccessChecker";
import { MemberFunctionChecker } from "./propertyAccess/memberFunctionChecker";
import { StringLengthAccessChecker } from "./propertyAccess/stringLengthAccessChecker";

export class PropertyAccessExpressionVisitor extends NodeVisitor {
    private readonly checkers: NodeVisitor[] = [
        new ConsoleLogAccessChecker(this),
        new StringLengthAccessChecker(this),
        new MemberFunctionChecker(this)
    ];

    public visit(node: PropertyAccessExpression) {
        const { expression, name } = node;

        for (const checker of this.checkers) {
            const checkedResult = checker.visit(node);

            if (checkedResult !== undefined) {
                return checkedResult;
            }
        }

        return undefined;
    }
}

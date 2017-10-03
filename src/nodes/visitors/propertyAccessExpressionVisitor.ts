import { CommandNames } from "general-language-syntax";
import { PropertyAccessExpression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";
import { ConsoleLogAccessChecker } from "./propertyAccess/consoleLogAccessChecker";
import { MemberOrStaticFunctionChecker } from "./propertyAccess/memberOrStaticFunctionChecker";
import { MemberVariableChecker } from "./propertyAccess/memberVariableChecker";
import { PropertyAccessChecker } from "./propertyAccess/propertyAccessChecker";
import { StringLengthAccessChecker } from "./propertyAccess/stringLengthAccessChecker";

const couldNotDetermineAccessComplaint = "Could not determine type of property access.";

export class PropertyAccessExpressionVisitor extends NodeVisitor {
    private readonly checkers: PropertyAccessChecker[] = [
        new ConsoleLogAccessChecker(this),
        new StringLengthAccessChecker(this),
        new MemberOrStaticFunctionChecker(this),
        new MemberVariableChecker(this),
    ];

    public visit(node: PropertyAccessExpression) {
        const { expression, name } = node;

        for (const checker of this.checkers) {
            const checkedResult = checker.visit(node);

            if (checkedResult !== undefined) {
                return checkedResult;
            }
        }

        return UnsupportedComplaint.forNode(
            node,
            this.sourceFile,
            couldNotDetermineAccessComplaint);
    }
}

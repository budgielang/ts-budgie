import { PropertyAccessExpression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { NodeVisitor } from "../visitor";
import { ArrayMemberFunctionChecker } from "./propertyAccess/arrayMemberFunctionChecker";
import { ConsoleLogAccessChecker } from "./propertyAccess/consoleLogAccessChecker";
import { DictionaryIndexAccessChecker } from "./propertyAccess/dictionaryIndexAccessChecker";
import { HasOwnPropertyAccessChecker } from "./propertyAccess/hasOwnPropertyAccessChecker";
import { MemberOrStaticFunctionChecker } from "./propertyAccess/memberOrStaticFunctionChecker";
import { MemberVariableChecker } from "./propertyAccess/memberVariableChecker";
import { PropertyAccessChecker } from "./propertyAccess/propertyAccessChecker";
import { StringLengthAccessChecker } from "./propertyAccess/stringLengthAccessChecker";
import { StringMemberFunctionChecker } from "./propertyAccess/stringMemberFunctionChecker";

const couldNotDetermineAccessComplaint = "Could not determine type of property access.";

export class PropertyAccessExpressionVisitor extends NodeVisitor {
    private readonly checkers: PropertyAccessChecker[] = [
        new ArrayMemberFunctionChecker(this),
        new ConsoleLogAccessChecker(this),
        new DictionaryIndexAccessChecker(this),
        new HasOwnPropertyAccessChecker(this),
        new StringLengthAccessChecker(this),
        new StringMemberFunctionChecker(this),
        new MemberOrStaticFunctionChecker(this),
        new MemberVariableChecker(this),
    ];

    public visit(node: PropertyAccessExpression) {
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

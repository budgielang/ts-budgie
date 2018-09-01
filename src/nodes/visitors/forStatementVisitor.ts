import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine } from "../../output/unsupported";
import { getNumericTypeNameFromUsages } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

const forLoopsMustBeAdditiveComplaint = "For loops over numbers must change the iterator with addition.";

const irregularComplaint = "Could not parse irregular for loop.";

export class ForStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForStatement) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                this.getTransformationContents(node),
            ),
        ];
    }

    private getTransformationContents(node: ts.ForStatement) {
        const { condition, incrementor, initializer } = node;
        if (
            condition === undefined
            || incrementor === undefined
            || initializer === undefined
            || !ts.isVariableDeclarationList(initializer)
            || initializer.declarations.length !== 1) {
            return [
                createUnsupportedGlsLine(irregularComplaint),
            ];
        }

        const declaration = initializer.declarations[0];
        if (declaration.initializer === undefined) {
            return [
                createUnsupportedGlsLine(irregularComplaint),
            ];
        }

        const name = (declaration.name as ts.Identifier).text;
        const incrementorText = this.getIncrementorIfNotOne(name, incrementor);
        const end = this.getConditionEnd(name, condition);
        const start = declaration.initializer.getText(this.sourceFile);
        const realType = typeof end === "string"
            ? getNumericTypeNameFromUsages([
                start,
                end
            ])
            : "float";

        const bodyNodes = this.router.recurseIntoNode(node.statement);
        const parameters = [name, realType, start, end];
        if (incrementorText !== undefined) {
            parameters.push(incrementorText);
        }

        return [
            new GlsLine(CommandNames.ForNumbersStart, ...parameters),
            ...bodyNodes,
            new GlsLine(CommandNames.ForNumbersEnd)
        ];
    }

    private getIncrementorIfNotOne(target: string, incrementor: ts.Expression) {
        if (ts.isPostfixUnaryExpression(incrementor) || ts.isPrefixUnaryExpression(incrementor)) {
            return undefined;
        }

        if (ts.isBinaryExpression(incrementor)
            && incrementor.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken
            && (incrementor.left as ts.Identifier).text === target) {
            const right = incrementor.right as ts.Identifier;

            return right.text === "1"
                ? undefined
                : right.text;
        }

        return createUnsupportedGlsLine(forLoopsMustBeAdditiveComplaint);
    }

    private getConditionEnd(target: string, condition: ts.Expression) {
        if (!ts.isBinaryExpression(condition)
            || (condition.left as ts.Identifier).text !== target
            || condition.operatorToken.kind !== ts.SyntaxKind.LessThanToken) {
            return createUnsupportedGlsLine(irregularComplaint);
        }

        if (ts.isNumericLiteral(condition.right)) {
            return condition.right.text;
        }

        return this.router.recurseIntoValue(condition.right);
    }
}

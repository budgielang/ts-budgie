import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { getNumericTypeNameFromUsages } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

const forLoopsMustBeAdditiveComplaint = "For loops over numbers must change the iterator with addition.";

const irregularComplaint = "Could not parse irregular for loop.";

export class ForStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForStatement) {
        const { condition, incrementor, initializer } = node;
        if (
            condition === undefined
            || incrementor === undefined
            || initializer === undefined
            || !ts.isVariableDeclarationList(initializer)
            || initializer.declarations.length !== 1) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, irregularComplaint);
        }

        const declaration = initializer.declarations[0];
        if (declaration.initializer === undefined || !ts.isNumericLiteral(declaration.initializer)) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, irregularComplaint);
        }

        const name = (declaration.name as ts.Identifier).text;
        const incrementorText = this.getIncrementorIfNotOne(name, incrementor);
        if (incrementorText instanceof UnsupportedComplaint) {
            return incrementorText;
        }

        const end = this.getConditionEnd(name, condition, this.sourceFile);
        if (end instanceof UnsupportedComplaint) {
            return end;
        }

        const start = declaration.initializer.getText(this.sourceFile);
        const realType = typeof end === "string"
            ? getNumericTypeNameFromUsages([
                declaration.initializer.text,
                end
            ])
            : "float";

        const bodyNodes = this.router.recurseIntoNode(node.statement);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        const parameters = [name, realType, start, end];
        if (incrementorText !== undefined) {
            parameters.push(incrementorText);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ForNumbersStart, ...parameters),
                    ...bodyNodes,
                    new GlsLine(CommandNames.ForNumbersEnd)
                ])
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

        return UnsupportedComplaint.forNode(incrementor, this.sourceFile, forLoopsMustBeAdditiveComplaint);
    }

    private getConditionEnd(target: string, condition: ts.Expression, sourceFile: ts.SourceFile) {
        if (!ts.isBinaryExpression(condition)
            || (condition.left as ts.Identifier).text !== target
            || condition.operatorToken.kind !== ts.SyntaxKind.LessThanToken) {
            return UnsupportedComplaint.forNode(condition, this.sourceFile, irregularComplaint);
        }

        if (ts.isNumericLiteral(condition.right)) {
            return condition.right.text;
        }

        return this.router.recurseIntoValue(condition.right);
    }
}

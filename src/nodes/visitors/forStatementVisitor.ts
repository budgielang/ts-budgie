import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { getNumericTypeNameFromUsages } from "../../parsing/numerics";
import { NodeVisitor } from "../visitor";

const isIncrementorIncreasingByOne = (target: string, incrementor: ts.Expression) => {
    if (ts.isPostfixUnaryExpression(incrementor) || ts.isPrefixUnaryExpression(incrementor)) {
        return true;
    }

    if (ts.isBinaryExpression(incrementor)) {
        return incrementor.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken
            && (incrementor.left as ts.Identifier).text === target
            && (incrementor.right as ts.Identifier).text === "1";
    }

    return false;
};

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
        if (!isIncrementorIncreasingByOne(name, incrementor)) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, irregularComplaint);
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

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ForNumbersStart, name, realType, start, end),
                    ...bodyNodes,
                    new GlsLine(CommandNames.ForNumbersEnd)
                ])
    ];
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

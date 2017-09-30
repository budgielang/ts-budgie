import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../glsLine";
import { getNumericTypeNameFromUsages } from "../../parsing/numerics";
import { Transformation } from "../../transformation";
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

const getConditionEnd = (target: string, condition: ts.Expression, sourceFile: ts.SourceFile) => {
    if (!ts.isBinaryExpression(condition)
        || (condition.left as ts.Identifier).text !== target
        || condition.operatorToken.kind !== ts.SyntaxKind.LessThanToken
        || condition.right.kind !== ts.SyntaxKind.NumericLiteral) {
        return undefined;
    }

    return condition.right.getText(sourceFile);
};

export class ForStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForStatement) {
        const statement = this.router.recurseIntoValue(node.statement);
        const { condition, incrementor, initializer } = node;
        if (
            condition === undefined
            || incrementor === undefined
            || initializer === undefined
            || !ts.isVariableDeclarationList(initializer)
            || initializer.declarations.length !== 1) {
            return undefined;
        }

        const declaration = initializer.declarations[0];
        if (declaration.initializer === undefined || !ts.isNumericLiteral(declaration.initializer)) {
            return undefined;
        }

        const name = (declaration.name as ts.Identifier).text;
        if (!isIncrementorIncreasingByOne(name, incrementor)) {
            return undefined;
        }

        const end = getConditionEnd(name, condition, this.sourceFile);
        if (end === undefined) {
            return undefined;
        }

        const realType = getNumericTypeNameFromUsages([
            declaration.initializer.text,
            end
        ]);

        const start = declaration.initializer.getText(this.sourceFile);
        const output: (string | GlsLine)[] = [
            new GlsLine(CommandNames.ForNumbersStart, name, realType, start, end)
        ];

        if (statement !== undefined) {
            output.push(statement);
        }

        output.push(new GlsLine(CommandNames.ForNumbersEnd));

        return [
            Transformation.fromNode(node, this.sourceFile, output)
        ];
    }
}

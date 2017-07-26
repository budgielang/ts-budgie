import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../glsLine";
import { getNodeTypeName, getNumericTypeName } from "../../parsing/names";
import { Transformation } from "../../transformation";
import { visitNode, visitNodes } from "../visitNode";
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

// name, type, start, end
export class ForStatementVisitor extends NodeVisitor {
    public visit(node: ts.ForStatement, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
        const statement = this.recurseOnValue(node.statement, sourceFile, typeChecker);
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
        if (declaration === undefined || declaration.initializer === undefined || !ts.isNumericLiteral(declaration.initializer)) {
            return undefined;
        }

        const name = (declaration.name as ts.Identifier).text;
        if (name === undefined) {
            return undefined;
        }
        if (!isIncrementorIncreasingByOne(name, incrementor)) {
            return undefined;
        }

        const end = getConditionEnd(name, condition, sourceFile);
        if (end === undefined) {
            return undefined;
        }

        const realType = getNumericTypeName([
            declaration.initializer.text,
            end
        ]);

        const start = declaration.initializer.getText(sourceFile);

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.ForNumbersStart, name, realType, start, end),
                    statement as GlsLine,
                    new GlsLine(CommandNames.ForNumbersEnd)
                ])
        ];
    }
}

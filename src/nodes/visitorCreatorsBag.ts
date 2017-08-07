import { SyntaxKind } from "typescript";

import { NodeVisitor } from "./visitor";
import { ArrayLiteralExpressionVisitor } from "./visitors/arrayLiteralExpressionVisitor";
import { BinaryExpressionVisitor } from "./visitors/binaryExpressionVisitor";
import { BreakStatementVisitor } from "./visitors/breakStatementVisitor";
import { ClassDeclarationVisitor } from "./visitors/classDeclarationVisitor";
import { ConstructorDeclarationVisitor } from "./visitors/constructorDeclarationVisitor";
import { ContinueStatementVisitor } from "./visitors/continueStatementVisitor";
import { ForOfStatementVisitor } from "./visitors/forOfStatementVisitor";
import { ForStatementVisitor } from "./visitors/forStatementVisitor";
import { IfStatementVisitor } from "./visitors/ifStatementVisitor";
import { LiteralVisitor } from "./visitors/literalVisitor";
import { ParenthesizedExpressionVisitor } from "./visitors/parenthesizedExpressionVisitor";
import { PropertyAccessExpressionVisitor } from "./visitors/propertyAccessExpressionVisitor";
import { PropertyDeclarationVisitor } from "./visitors/propertyDeclarationVisitor";
import { SourceFileVisitor } from "./visitors/sourceFileVisitor";
import { StringLiteralVisitor } from "./visitors/stringLiteralVisitor";
import { TypeLiteralVisitor } from "./visitors/typeLiteralVisitor";
import { VariableDeclarationVisitor } from "./visitors/variableDeclarationVisitor";
import { WhileStatementVisitor } from "./visitors/whileStatementVisitor";

interface IVisitorCreators {
    [i: number /* SyntaxKind */]: typeof NodeVisitor;
}

const creators: IVisitorCreators = {
    [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpressionVisitor,
    [SyntaxKind.BinaryExpression]: BinaryExpressionVisitor,
    [SyntaxKind.BreakStatement]: BreakStatementVisitor,
    [SyntaxKind.ClassDeclaration]: ClassDeclarationVisitor,
    [SyntaxKind.Constructor]: ConstructorDeclarationVisitor,
    [SyntaxKind.ContinueKeyword]: ContinueStatementVisitor,
    [SyntaxKind.FalseKeyword]: LiteralVisitor,
    [SyntaxKind.FirstLiteralToken]: LiteralVisitor,
    [SyntaxKind.ForStatement]: ForStatementVisitor,
    [SyntaxKind.ForOfStatement]: ForOfStatementVisitor,
    [SyntaxKind.Identifier]: LiteralVisitor,
    [SyntaxKind.IfStatement]: IfStatementVisitor,
    [SyntaxKind.NumericLiteral]: LiteralVisitor,
    [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpressionVisitor,
    [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpressionVisitor,
    [SyntaxKind.PropertyDeclaration]: PropertyDeclarationVisitor,
    [SyntaxKind.SourceFile]: SourceFileVisitor,
    [SyntaxKind.StringLiteral]: StringLiteralVisitor,
    [SyntaxKind.TrueKeyword]: LiteralVisitor,
    [SyntaxKind.TypeLiteral]: TypeLiteralVisitor,
    [SyntaxKind.VariableDeclaration]: VariableDeclarationVisitor,
    [SyntaxKind.WhileStatement]: WhileStatementVisitor,
};

/**
 * Holds visitor creators by their node syntax kind.
 */
export class VisitorCreatorsBag {
    /**
     * Gets the creator for a node syntax kind.
     *
     * @param kind   Syntax kind for a node.
     * @returns A creator for that kind of node.
     */
    public getCreator(kind: SyntaxKind) {
        return creators[kind];
    }
}

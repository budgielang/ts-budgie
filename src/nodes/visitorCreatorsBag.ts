import { SyntaxKind } from "typescript";

import { NodeVisitor } from "./visitor";
import { ArrayLiteralExpressionVisitor } from "./visitors/arrayLiteralExpressionVisitor";
import { BinaryExpressionVisitor } from "./visitors/binaryExpressionVisitor";
import { ClassDeclarationVisitor } from "./visitors/classDeclarationVisitor";
import { ForOfStatementVisitor } from "./visitors/forOfStatementVisitor";
import { ForStatementVisitor } from "./visitors/forStatementVisitor";
import { IfStatementVisitor } from "./visitors/ifStatementVisitor";
import { ParenthesizedExpressionVisitor } from "./visitors/parenthesizedExpressionVisitor";
import { PropertyAccessExpressionVisitor } from "./visitors/propertyAccessExpressionVisitor";
import { PropertyDeclarationVisitor } from "./visitors/propertyDeclarationVisitor";
import { SourceFileVisitor } from "./visitors/sourceFileVisitor";
import { TypeLiteralVisitor } from "./visitors/typeLiteralVisitor";
import { VariableDeclarationVisitor } from "./visitors/variableDeclarationVisitor";
import { WhileStatementVisitor } from "./visitors/whileStatementVisitor";

interface IVisitorCreators {
    [i: number /* SyntaxKind */]: typeof NodeVisitor;
}

const creators: IVisitorCreators = {
    [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpressionVisitor,
    [SyntaxKind.BinaryExpression]: BinaryExpressionVisitor,
    [SyntaxKind.ClassDeclaration]: ClassDeclarationVisitor,
    [SyntaxKind.ForStatement]: ForStatementVisitor,
    [SyntaxKind.ForOfStatement]: ForOfStatementVisitor,
    [SyntaxKind.IfStatement]: IfStatementVisitor,
    [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpressionVisitor,
    [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpressionVisitor,
    [SyntaxKind.PropertyDeclaration]: PropertyDeclarationVisitor,
    [SyntaxKind.SourceFile]: SourceFileVisitor,
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

import { Node, SyntaxKind } from "typescript";

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

interface ISyntaxKindDictionary<TContents> {
    [i: number /* SyntaxKind */]: TContents;
}

const creators: ISyntaxKindDictionary<typeof NodeVisitor> = {
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

export class VisitorCreatorsBag {
    public getCreator(kind: SyntaxKind) {
        return creators[kind];
    }
}

import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { NodeVisitor } from "./visitor";
import { BinaryExpressionVisitor } from "./visitors/binaryExpressionVisitor";
import { ClassDeclarationVisitor } from "./visitors/classDeclarationVisitor";
import { IfStatementVisitor } from "./visitors/ifStatementVisitor";
import { ParenthesizedExpressionVisitor } from "./visitors/parenthesizedExpressionVisitor";
import { PropertyDeclarationVisitor } from "./visitors/propertyDeclarationVisitor";
import { VariableDeclarationVisitor } from "./visitors/variableDeclarationVisitor";
import { WhileStatementVisitor } from "./visitors/whileStatementVisitor";

export interface IVisitorsBag {
    [i: number /* SyntaxKind */]: NodeVisitor;
}

export const visitorsBag: IVisitorsBag = {
    [SyntaxKind.BinaryExpression]: new BinaryExpressionVisitor(),
    [SyntaxKind.ClassDeclaration]: new ClassDeclarationVisitor(),
    [SyntaxKind.IfStatement]: new IfStatementVisitor(),
    [SyntaxKind.ParenthesizedExpression]: new ParenthesizedExpressionVisitor(),
    [SyntaxKind.PropertyDeclaration]: new PropertyDeclarationVisitor(),
    [SyntaxKind.VariableDeclaration]: new VariableDeclarationVisitor(),
    [SyntaxKind.WhileStatement]: new WhileStatementVisitor(),
};

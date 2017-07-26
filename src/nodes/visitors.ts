import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { BinaryExpressionVisitor } from "./binaryExpressionVisitor";
import { ClassDeclarationVisitor } from "./classDeclarationVisitor";
import { IfStatementVisitor } from "./ifStatementVisitor";
import { ParenthesizedExpressionVisitor } from "./parenthesizedExpressionVisitor";
import { PropertyDeclarationVisitor } from "./propertyDeclarationVisitor";
import { VariableDeclarationVisitor } from "./variableDeclarationVisitor";
import { NodeVisitor } from "./visitor";
import { WhileStatementVisitor } from "./whileStatementVisitor";

export interface INodeVisitors {
    [i: number /* SyntaxKind */]: NodeVisitor;
}

export const nodeVisitors: INodeVisitors = {
    [SyntaxKind.BinaryExpression]: new BinaryExpressionVisitor(),
    [SyntaxKind.ClassDeclaration]: new ClassDeclarationVisitor(),
    [SyntaxKind.IfStatement]: new IfStatementVisitor(),
    [SyntaxKind.ParenthesizedExpression]: new ParenthesizedExpressionVisitor(),
    [SyntaxKind.PropertyDeclaration]: new PropertyDeclarationVisitor(),
    [SyntaxKind.VariableDeclaration]: new VariableDeclarationVisitor(),
    [SyntaxKind.WhileStatement]: new WhileStatementVisitor(),
};

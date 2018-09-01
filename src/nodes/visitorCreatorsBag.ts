import * as ts from "typescript";

import { NodeVisitor } from "./visitor";
import { ArrayLiteralExpressionVisitor } from "./visitors/arrayLiteralExpressionVisitor";
import { BinaryExpressionVisitor } from "./visitors/binaryExpressionVisitor";
import { BreakStatementVisitor } from "./visitors/breakStatementVisitor";
import { CallExpressionVisitor } from "./visitors/callExpressionVisitor";
import { ClassDeclarationVisitor } from "./visitors/classDeclarationVisitor";
import { ConstructorDeclarationVisitor } from "./visitors/constructorDeclarationVisitor";
import { ContinueStatementVisitor } from "./visitors/continueStatementVisitor";
import { ElementAccessExpressionVisitor } from "./visitors/elementAccessExpressionVisitor";
import { EnumDeclarationVisitor } from "./visitors/enumDeclarationVisitor";
import { EnumMemberVisitor } from "./visitors/enumMemberVisitor";
import { ForOfStatementVisitor } from "./visitors/forOfStatementVisitor";
import { ForStatementVisitor } from "./visitors/forStatementVisitor";
import { IfStatementVisitor } from "./visitors/ifStatementVisitor";
import { ImportDeclarationVisitor } from "./visitors/importDeclarationVisitor";
import { InterfaceDeclarationVisitor } from "./visitors/interfaceDeclarationVisitor";
import { LiteralVisitor } from "./visitors/literalVisitor";
import { MethodDeclarationVisitor } from "./visitors/methodDeclarationVisitor";
import { MethodSignatureVisitor } from "./visitors/methodSignatureVisitor";
import { NewExpressionVisitor } from "./visitors/newExpressionVisitor";
import { ObjectLiteralExpressionVisitor } from "./visitors/objectLiteralExpressionVisitor";
import { ParenthesizedExpressionVisitor } from "./visitors/parenthesizedExpressionVisitor";
import { PropertyAccessExpressionVisitor } from "./visitors/propertyAccessExpressionVisitor";
import { PropertyAssignmentVisitor } from "./visitors/propertyAssignmentVisitor";
import { PropertyDeclarationVisitor } from "./visitors/propertyDeclarationVisitor";
import { ReturnStatementVisitor } from "./visitors/returnStatementVisitor";
import { SourceFileVisitor } from "./visitors/sourceFileVisitor";
import { StringLiteralVisitor } from "./visitors/stringLiteralVisitor";
import { ThisExpressionVisitor } from "./visitors/thisExpressionVisitor";
import { TypeLiteralVisitor } from "./visitors/typeLiteralVisitor";
import { UnsupportedVisitor } from "./visitors/unsupportedVisitor";
import { VariableDeclarationVisitor } from "./visitors/variableDeclarationVisitor";
import { WhileStatementVisitor } from "./visitors/whileStatementVisitor";

interface IVisitorCreators {
    [i: number /* SyntaxKind */]: typeof NodeVisitor;
}

const creators: IVisitorCreators = {
    [ts.SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpressionVisitor,
    [ts.SyntaxKind.BinaryExpression]: BinaryExpressionVisitor,
    [ts.SyntaxKind.BreakStatement]: BreakStatementVisitor,
    [ts.SyntaxKind.CallExpression]: CallExpressionVisitor,
    [ts.SyntaxKind.ClassDeclaration]: ClassDeclarationVisitor,
    [ts.SyntaxKind.ClassExpression]: UnsupportedVisitor.withDescriptor("class expressions"),
    [ts.SyntaxKind.Constructor]: ConstructorDeclarationVisitor,
    [ts.SyntaxKind.ContinueKeyword]: ContinueStatementVisitor,
    [ts.SyntaxKind.ElementAccessExpression]: ElementAccessExpressionVisitor,
    [ts.SyntaxKind.EnumDeclaration]: EnumDeclarationVisitor,
    [ts.SyntaxKind.EnumMember]: EnumMemberVisitor,
    [ts.SyntaxKind.ExportDeclaration]: UnsupportedVisitor.withDescriptor("exports"),
    [ts.SyntaxKind.FalseKeyword]: LiteralVisitor,
    [ts.SyntaxKind.FirstLiteralToken]: LiteralVisitor,
    [ts.SyntaxKind.ForOfStatement]: ForOfStatementVisitor,
    [ts.SyntaxKind.ForStatement]: ForStatementVisitor,
    [ts.SyntaxKind.Identifier]: LiteralVisitor,
    [ts.SyntaxKind.IfStatement]: IfStatementVisitor,
    [ts.SyntaxKind.ImportDeclaration]: ImportDeclarationVisitor,
    [ts.SyntaxKind.InterfaceDeclaration]: InterfaceDeclarationVisitor,
    [ts.SyntaxKind.MethodDeclaration]: MethodDeclarationVisitor,
    [ts.SyntaxKind.MethodSignature]: MethodSignatureVisitor,
    [ts.SyntaxKind.ModuleDeclaration]: UnsupportedVisitor.withDescriptor("namespaces"),
    [ts.SyntaxKind.NewExpression]: NewExpressionVisitor,
    [ts.SyntaxKind.NumericLiteral]: LiteralVisitor,
    [ts.SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpressionVisitor,
    [ts.SyntaxKind.ParenthesizedExpression]: ParenthesizedExpressionVisitor,
    [ts.SyntaxKind.PropertyAccessExpression]: PropertyAccessExpressionVisitor,
    [ts.SyntaxKind.PropertyAssignment]: PropertyAssignmentVisitor,
    [ts.SyntaxKind.PropertyDeclaration]: PropertyDeclarationVisitor,
    [ts.SyntaxKind.ReturnStatement]: ReturnStatementVisitor,
    [ts.SyntaxKind.SourceFile]: SourceFileVisitor,
    [ts.SyntaxKind.StringLiteral]: StringLiteralVisitor,
    [ts.SyntaxKind.SuperKeyword]: UnsupportedVisitor.withDescriptor("super"),
    [ts.SyntaxKind.SwitchStatement]: UnsupportedVisitor.withDescriptor("switch"),
    [ts.SyntaxKind.ThisKeyword]: ThisExpressionVisitor,
    [ts.SyntaxKind.TrueKeyword]: LiteralVisitor,
    [ts.SyntaxKind.TypeLiteral]: TypeLiteralVisitor,
    [ts.SyntaxKind.VariableDeclaration]: VariableDeclarationVisitor,
    [ts.SyntaxKind.WhileStatement]: WhileStatementVisitor,
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
    public getCreator(kind: ts.SyntaxKind): typeof NodeVisitor {
        return creators[kind];
    }
}

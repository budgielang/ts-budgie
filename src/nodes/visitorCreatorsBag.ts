import { SyntaxKind } from "typescript";

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
    [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpressionVisitor,
    [SyntaxKind.BinaryExpression]: BinaryExpressionVisitor,
    [SyntaxKind.BreakStatement]: BreakStatementVisitor,
    [SyntaxKind.CallExpression]: CallExpressionVisitor,
    [SyntaxKind.ClassDeclaration]: ClassDeclarationVisitor,
    [SyntaxKind.ClassExpression]: UnsupportedVisitor.withDescriptor("class expressions"),
    [SyntaxKind.Constructor]: ConstructorDeclarationVisitor,
    [SyntaxKind.ContinueKeyword]: ContinueStatementVisitor,
    [SyntaxKind.ElementAccessExpression]: ElementAccessExpressionVisitor,
    [SyntaxKind.EnumDeclaration]: EnumDeclarationVisitor,
    [SyntaxKind.EnumMember]: EnumMemberVisitor,
    [SyntaxKind.ExportDeclaration]: UnsupportedVisitor.withDescriptor("exports"),
    [SyntaxKind.FalseKeyword]: LiteralVisitor,
    [SyntaxKind.FirstLiteralToken]: LiteralVisitor,
    [SyntaxKind.ForOfStatement]: ForOfStatementVisitor,
    [SyntaxKind.ForStatement]: ForStatementVisitor,
    [SyntaxKind.Identifier]: LiteralVisitor,
    [SyntaxKind.IfStatement]: IfStatementVisitor,
    [SyntaxKind.ImportDeclaration]: ImportDeclarationVisitor,
    [SyntaxKind.InterfaceDeclaration]: InterfaceDeclarationVisitor,
    [SyntaxKind.MethodDeclaration]: MethodDeclarationVisitor,
    [SyntaxKind.MethodSignature]: MethodSignatureVisitor,
    [SyntaxKind.ModuleDeclaration]: UnsupportedVisitor.withDescriptor("namespaces"),
    [SyntaxKind.NewExpression]: NewExpressionVisitor,
    [SyntaxKind.NumericLiteral]: LiteralVisitor,
    [SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpressionVisitor,
    [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpressionVisitor,
    [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpressionVisitor,
    [SyntaxKind.PropertyAssignment]: PropertyAssignmentVisitor,
    [SyntaxKind.PropertyDeclaration]: PropertyDeclarationVisitor,
    [SyntaxKind.ReturnStatement]: ReturnStatementVisitor,
    [SyntaxKind.StringLiteral]: StringLiteralVisitor,
    [SyntaxKind.SuperKeyword]: UnsupportedVisitor.withDescriptor("super"),
    [SyntaxKind.SwitchStatement]: UnsupportedVisitor.withDescriptor("switch"),
    [SyntaxKind.ThisKeyword]: ThisExpressionVisitor,
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
    public getCreator(kind: SyntaxKind): typeof NodeVisitor {
        return creators[kind];
    }
}

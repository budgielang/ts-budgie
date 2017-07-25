import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { visitClassDeclaration } from "./visitClassDeclaration";
import { visitPropertyDeclaration } from "./visitPropertyDeclaration";
import { visitVariableDeclaration } from "./visitVariableDeclaration";

export type INodeVisitor = (node: Node, sourceFile: SourceFile, typeChecker: TypeChecker) => Transformation[] | undefined;

export interface INodeVisitors {
    [i: number /* SyntaxKind */]: INodeVisitor;
}

export const nodeVisitors: INodeVisitors = {
    [SyntaxKind.ClassDeclaration]: visitClassDeclaration,
    [SyntaxKind.PropertyDeclaration]: visitPropertyDeclaration,
    [SyntaxKind.VariableDeclaration]: visitVariableDeclaration,
};

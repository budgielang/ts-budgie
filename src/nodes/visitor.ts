import { Node, SourceFile, SyntaxKind } from "typescript";

import { Transformation } from "../transformation";
import { visitClassDeclaration } from "./visitClassDeclaration";
import { visitPropertyDeclaration } from "./visitPropertyDeclaration";

export type INodeVisitor = (node: Node, sourceFile: SourceFile) => Transformation[] | undefined;

export interface INodeVisitors {
    [i: number /* SyntaxKind */]: INodeVisitor;
}

export const nodeVisitors: INodeVisitors = {
    [SyntaxKind.ClassDeclaration]: visitClassDeclaration,
    [SyntaxKind.PropertyDeclaration]: visitPropertyDeclaration
};

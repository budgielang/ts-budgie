import { Node, SourceFile, SyntaxKind } from "typescript";

import { visitClassDeclaration } from "./visitClassDeclaration";
import { visitNodeChildren } from "./visitNode";

export type IVisitor = (node: Node, sourceFile: SourceFile) => string[];

export interface IVisitors {
    [i: number /* ts.SyntaxKind */]: IVisitor;
}

export const visitors: IVisitors = {
    [SyntaxKind.Unknown]: visitNodeChildren,
    [SyntaxKind.ClassDeclaration]: visitClassDeclaration
};

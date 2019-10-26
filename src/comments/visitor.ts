import * as ts from "typescript";

import { Transformation } from "../output/transformation";

import { visitMultiLineCommentTrivia } from "./visitMultiLineCommentTrivia";
import { visitSingleLineCommentTrivia } from "./visitSingleLineCommentTrivia";

export type ICommentVisitor = (fullText: string, comment: ts.CommentRange) => Transformation[] | undefined;

export interface ICommentVisitors {
    [i: number /* SyntaxKind */]: ICommentVisitor;
}

export const commentVisitors: ICommentVisitors = {
    [ts.SyntaxKind.SingleLineCommentTrivia]: visitSingleLineCommentTrivia,
    [ts.SyntaxKind.MultiLineCommentTrivia]: visitMultiLineCommentTrivia,
};

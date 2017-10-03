import { CommentRange, SyntaxKind } from "typescript";

import { Transformation } from "../output/transformation";
import { visitMultiLineCommentTrivia } from "./visitMultiLineCommentTrivia";
import { visitSingleLineCommentTrivia } from "./visitSingleLineCommentTrivia";

export type ICommentVisitor = (fullText: string, comment: CommentRange) => Transformation[] | undefined;

export interface ICommentVisitors {
    [i: number /* SyntaxKind */]: ICommentVisitor;
}

export const commentVisitors: ICommentVisitors = {
    [SyntaxKind.SingleLineCommentTrivia]: visitSingleLineCommentTrivia,
    [SyntaxKind.MultiLineCommentTrivia]: visitMultiLineCommentTrivia,
};

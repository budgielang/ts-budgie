import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../output/budgieLine";
import { Transformation } from "../output/transformation";

const parseCommentLines = (commentText: string) => {
    const lines = commentText.split(/\r\n|\r|\n/g);

    return lines.slice(1, lines.length - 1);
};

export const visitMultiLineCommentTrivia = (fullText: string, comment: ts.CommentRange) => {
    const commentLines = parseCommentLines(fullText.substring(comment.pos, comment.end));

    return [
        Transformation.fromCommentRange(comment, [
            new BudgieLine(CommandNames.CommentBlockStart),
            ...commentLines.map((line) => new BudgieLine(CommandNames.CommentBlock, line)),
            new BudgieLine(CommandNames.CommentBlockEnd),
        ]),
    ];
};

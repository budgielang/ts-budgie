import { CommandNames } from "general-language-syntax";
import { CommentRange } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";

const parseCommentLines = (commentText: string) => {
    const lines = commentText.split(/\r\n|\r|\n/g);

    return lines.slice(1, lines.length - 1);
};

export const visitMultiLineCommentTrivia = (fullText: string, comment: CommentRange) => {
    const commentLines = parseCommentLines(fullText.substring(comment.pos, comment.end));

    return [
        Transformation.fromCommentRange(
            comment,
            [
                new GlsLine(CommandNames.CommentBlockStart),
                ...commentLines.map((line) => new GlsLine(CommandNames.CommentBlock, line)),
                new GlsLine(CommandNames.CommentBlockEnd)
            ])
    ];
};

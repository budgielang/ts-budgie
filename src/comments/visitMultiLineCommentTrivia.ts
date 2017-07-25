import { CommandNames } from "general-language-syntax";
import { CommentRange, SourceFile } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";

export const visitMultiLineCommentTrivia = (fullText: string, comment: CommentRange) => {
    const commentLines = fullText.substring(comment.pos, comment.end)
        .split(/\r\n|\r|\n/g);

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

import { CommandNames } from "general-language-syntax";
import { CommentRange, SourceFile } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";

const parseCommentText = (commentText: string) => {
    if (commentText.substring(0, "//".length) === "//") {
        commentText = commentText.substring("//".length);
    }

    return commentText.trim();
};

export const visitSingleLineCommentTrivia = (fullText: string, comment: CommentRange) => {
    return [
        Transformation.fromCommentRange(
            comment,
            [
                new GlsLine(CommandNames.CommentLine, parseCommentText(fullText.substring(comment.pos, comment.end)))
            ])
    ];
};

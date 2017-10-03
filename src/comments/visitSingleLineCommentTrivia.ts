import { CommandNames } from "general-language-syntax";
import { CommentRange } from "typescript";

import { GlsLine } from "../output/glsLine";
import { Transformation } from "../output/transformation";

const parseCommentText = (commentText: string): string => {
    if (commentText.substring(0, "//".length) === "//") {
        return parseCommentText(commentText.substring("//".length));
    }

    return commentText.trim();
};

export const visitSingleLineCommentTrivia = (fullText: string, comment: CommentRange) =>
    [
        Transformation.fromCommentRange(
            comment,
            [
                new GlsLine(CommandNames.CommentLine, parseCommentText(fullText.substring(comment.pos, comment.end)))
            ])
    ];

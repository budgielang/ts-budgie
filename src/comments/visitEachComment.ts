import * as utils from "tsutils";
import { CommentRange, SourceFile } from "typescript";

import { Transformation } from "../output/transformation";
import { commentVisitors } from "./visitor";

export const visitEachComment = (sourceFile: SourceFile): Transformation[] => {
    const transformations: Transformation[] = [];

    const visitComment = (fullText: string, comment: CommentRange) => {
        const childTransformations = commentVisitors[comment.kind](fullText, comment);

        if (childTransformations !== undefined) {
            transformations.push(...childTransformations);
        }
    };

    utils.forEachComment(sourceFile, visitComment);

    return transformations;
};

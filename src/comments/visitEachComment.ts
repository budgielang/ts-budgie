import * as utils from "tsutils";
import * as ts from "typescript";

import { Transformation } from "../output/transformation";
import { ITransformerSettings } from "../service";
import { commentVisitors } from "./visitor";

export const visitEachComment = ({ sourceFile }: ITransformerSettings): Transformation[] => {
    const transformations: Transformation[] = [];

    const visitComment = (fullText: string, comment: ts.CommentRange) => {
        const childTransformations = commentVisitors[comment.kind](fullText, comment);

        if (childTransformations !== undefined) {
            transformations.push(...childTransformations);
        }
    };

    utils.forEachComment(sourceFile, visitComment);

    return transformations;
};

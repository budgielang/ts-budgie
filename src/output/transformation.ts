import * as ts from "typescript";

import { GlsLine } from "./glsLine";
import { IRange } from "./range";

/**
 * Output from any level of node.
 */
export type IOutput = (string | GlsLine | Transformation)[];

/**
 * How a range of source should become GLS output.
 */
export class Transformation {
    /**
     * Area in the source file to transform.
     */
    public readonly range: IRange;

    /**
     * Output transformation.
     */
    public readonly output: IOutput;

    /**
     * Initializes a new instance of the Transformation class.
     *
     * @param range   Area in the source file to transform.
     * @param output   Output transformation.
     * @param sourceFile   Source file of the transformation.
     */
    private constructor(range: IRange, output: IOutput) {
        this.range = range;
        this.output = output;
    }

    /**
     * Initializes a new Transformation for a comment range.
     *
     * @param range   Area in the source file to transform.
     * @param output   Output transformation.
     * @param sourceFile   Source file of the transformation.
     * @returns A new Transformation for the comment range.
     */
    public static fromCommentRange(range: ts.CommentRange, output: IOutput): Transformation {
        return new Transformation(
            {
                end: range.end,
                start: range.pos
            },
            output);
    }

    /**
     * Initializes a new Transform for a standard node.
     *
     * @param node   Node from the source file.
     * @param sourceFile   Source file for the node.
     * @param output   Output transformation.
     * @returns A new Transformation for the node.
     */
    public static fromNode(node: ts.Node, sourceFile: ts.SourceFile, output: IOutput): Transformation {
        return new Transformation(
            {
                end: node.getEnd(),
                start: node.getStart(sourceFile)
            },
            output);
    }
}

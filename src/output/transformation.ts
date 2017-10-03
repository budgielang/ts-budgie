import { CommentRange, Node, SourceFile } from "typescript";

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
     */
    private constructor(range: IRange, output: IOutput) {
        this.range = range;
        this.output = output;
    }

    /**
     * Initializes a new Transform for a comment range.
     *
     * @param range   Area in the source file to transform.
     * @param output   Output transformation.
     */
    public static fromCommentRange(range: CommentRange, output: IOutput): Transformation {
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
    public static fromNode(node: Node, sourceFile: SourceFile, output: IOutput): Transformation {
        return new Transformation(
            {
                end: node.getEnd(),
                start: node.getStart(sourceFile)
            },
            output);
    }
}
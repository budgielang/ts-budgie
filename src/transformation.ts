import { CommentRange, Node, SourceFile } from "typescript";

import { GlsLine } from "./glsLine";

export type IOutput = (GlsLine | Transformation)[];

export interface IRange {
    end: number;
    start: number;
}

export class Transformation {
    public readonly range: IRange;
    public readonly output: IOutput;

    private constructor(range: IRange, output: IOutput) {
        this.range = range;
        this.output = output;
    }

    public static fromCommentRange(range: CommentRange, output: IOutput): Transformation {
        return new Transformation(
            {
                end: range.end,
                start: range.pos
            },
            output);
    }

    public static fromNode(node: Node, sourceFile: SourceFile, output: IOutput): Transformation {
        return new Transformation(
            {
                end: node.getEnd(),
                start: node.getStart(sourceFile)
            },
            output);
    }
}

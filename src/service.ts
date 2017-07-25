import { SourceFile } from "typescript";

import { visitEachComment } from "./comments/visitEachComment";
import { Merger } from "./merger";
import { visitSourceFile } from "./nodes/visitNode";
import { Transformation } from "./transformation";

export type ITransformer = (sourceFile: SourceFile) => Transformation[];

const isTransformationEarlierThan = (left: Transformation, right: Transformation) =>
    left.range.start < right.range.start;

export class TransformationService {
    private readonly merger: Merger<Transformation>;
    private readonly transformers: ITransformer[];

    public constructor(transformers: ITransformer[]) {
        this.merger = new Merger(isTransformationEarlierThan);
        this.transformers = transformers;
    }

    public transform(sourceFile: SourceFile): Transformation[] {
        const transformations: Transformation[][] = [];

        for (const transformer of this.transformers) {
            transformations.push(transformer(sourceFile));
        }

        return this.merger.merge(transformations);
    }

    public static standard(): TransformationService {
        return new TransformationService([
            visitEachComment,
            visitSourceFile
        ]);
    }
}

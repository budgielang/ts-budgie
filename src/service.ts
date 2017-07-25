import { SourceFile, TypeChecker } from "typescript";

import { visitEachComment } from "./comments/visitEachComment";
import { Merger } from "./merger";
import { visitSourceFile } from "./nodes/visitNode";
import { Transformation } from "./transformation";

export type ITransformer = (sourceFile: SourceFile, typeChecker: TypeChecker) => Transformation[];

const isTransformationEarlierThan = (left: Transformation, right: Transformation) =>
    left.range.start < right.range.start;

export class TransformationService {
    private readonly merger: Merger<Transformation>;
    private readonly transformers: ITransformer[];
    private readonly typeChecker: TypeChecker;

    public constructor(transformers: ITransformer[], typeChecker: TypeChecker) {
        this.merger = new Merger(isTransformationEarlierThan);
        this.transformers = transformers;
        this.typeChecker = typeChecker;
    }

    public transform(sourceFile: SourceFile): Transformation[] {
        const transformations: Transformation[][] = [];

        for (const transformer of this.transformers) {
            transformations.push(transformer(sourceFile, this.typeChecker));
        }

        return this.merger.merge(transformations);
    }

    public static standard(typeChecker: TypeChecker): TransformationService {
        return new TransformationService(
            [
                visitEachComment,
                visitSourceFile
            ],
            typeChecker);
    }
}

import { SourceFile, TypeChecker } from "typescript";

import { UnsupportedComplaint } from "./output/complaint";
import { Transformation } from "./output/transformation";

/**
 * Retrieves source-to-GLS transforms from a file.
 *
 * @param sourceFile   Source file to transform.
 * @param typeChecker   Type checker for the source file.
 * @returns Transformations from the file, or a complaint for unsupported syntax.
 */
export type ITransformer = (sourceFile: SourceFile, typeChecker: TypeChecker) => (Transformation | UnsupportedComplaint)[];

/**
 * Determines which of two transformations is earlier in their file.
 *
 * @param left   A file transformation.
 * @param right   A file transformation.
 * @returns Whether the first transformation is earlier than the second.
 */
const isTransformationEarlierThan = (left: Transformation, right: Transformation) =>
    left.range.start < right.range.start;

/**
 * Retrieves and merges source-to-GLS transforms from files.
 */
export interface ITransformationService {
    /**
     * Retrieves transforms from a file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the file.
     * @returns Transformations from the file, or a complaint for unsupported syntax.
     */
    transform(sourceFile: SourceFile, typeChecker: TypeChecker): (Transformation | UnsupportedComplaint)[];
}

/**
 * Retrieves and merges source-to-GLS transforms from files.
 */
export class TransformationService {
    /**
     * Transformations to retrieve source-to-GLS transforms from a file.
     */
    private readonly transformers: ITransformer[];

    /**
     * Initializes a new instance of the TransformationService class.
     *
     * @param transformers   Transformations to retrieve source-to-GLS transforms from a file.
     */
    public constructor(transformers: ITransformer[]) {
        this.transformers = transformers;
    }

    /**
     * Retrieves transforms from a file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the file.
     * @returns Transformations from the file, or a complaint for unsupported syntax.
     */
    public transform(sourceFile: SourceFile, typeChecker: TypeChecker): (Transformation | UnsupportedComplaint)[] {
        const transformations: (UnsupportedComplaint | Transformation)[] = [];

        for (const transformer of this.transformers) {
            transformations.push(...transformer(sourceFile, typeChecker));
        }

        return transformations;
    }
}

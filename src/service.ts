import * as ts from "typescript";

import { Transformation } from "./output/transformation";

/**
 * Constant conversion options for visiting nodes.
 */
export interface IContextOptions {
    /**
     * Base or root directory to ignore from the beginning of file paths, such as "src/".
     */
    baseDirectory: string;

    /**
     * Namespace before path names, such as "Budgie".
     */
    outputNamespace: string;
}

/**
 * Settings to transform a file.
 */
export interface ITransformerSettings {
    /**
     * Constant transformation options for visiting nodes.
     */
    contextOptions: IContextOptions;

    /**
     * Source file to transform.
     */
    sourceFile: ts.SourceFile;

    /**
     * Type checker for the source file.
     */
    typeChecker: ts.TypeChecker;
}

/**
 * Retrieves source-to-Budgie transforms from a file.
 *
 * @param sourceFile   Source file to transform.
 * @param typeChecker   Type checker for the source file.
 * @returns Transformations from the file, or a complaint for unsupported syntax.
 */
export type ITransformer = (settings: ITransformerSettings) => Transformation[];

/**
 * Retrieves and merges source-to-Budgie transforms from files.
 */
export class TransformationService {
    /**
     * Transformations to retrieve source-to-Budgie transforms from a file.
     */
    private readonly transformers: ITransformer[];

    /**
     * Initializes a new instance of the TransformationService class.
     *
     * @param transformers   Transformations to retrieve source-to-Budgie transforms from a file.
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
    public transform(settings: ITransformerSettings): Transformation[] {
        const transformations: Transformation[] = [];

        for (const transformer of this.transformers) {
            transformations.push(...transformer(settings));
        }

        return transformations;
    }
}

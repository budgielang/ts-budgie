import * as ts from "typescript";

import { visitEachComment } from "./comments/visitEachComment";
import { visitSourceFile } from "./nodes/visitSourceFile";
import { TransformationsPrinter } from "./printing/transformationsPrinter";
import { ITransformer, TransformationService } from "./service";
import { Transformer } from "./transforms";
export { BudgieLine } from "./output/budgieLine";
export { IOutput, Transformation } from "./output/transformation";
export { IRange } from "./output/range";
export { ITransformer, TransformationService } from "./service";
export * from "./transforms";

/**
 * Options to run ts-budgie.
 */
export interface ITsBudgieOptions {
    /**
     * Base or root directory to ignore from the beginning of file paths, such as "src/", if not "".
     */
    baseDirectory?: string;

    /**
     * TypeScript compiler options to run with (not recommended).
     */
    compilerOptions?: ts.CompilerOptions;

    /**
     * Namespace before path names, such as "Budgie", if not "".
     */
    outputNamespace?: string;

    /**
     * Whether to visit comments in addition to content nodes.
     */
    skipComments?: boolean;

    /**
     * Source files to load into the program.
     */
    sourceFiles: ts.SourceFile[];
}

/**
 * Creates a TypeScript-to-Budgie code transformer.
 *
 * @returns A TypeScript-to-Budgie code transformer.
 */
export const createTransformer = (options: ITsBudgieOptions) => {
    const transformers: ITransformer[] = [visitSourceFile];

    // For now, we skip comments to avoid having to resolve positioning
    if (options.skipComments === false) {
        transformers.push(visitEachComment);
    }

    return new Transformer({
        compilerOptions: options.compilerOptions === undefined ? {} : options.compilerOptions,
        contextOptions: {
            baseDirectory: options.baseDirectory === undefined ? "" : options.baseDirectory,
            outputNamespace: options.outputNamespace === undefined ? "" : options.outputNamespace,
        },
        printer: new TransformationsPrinter(),
        service: new TransformationService(transformers),
        sourceFiles: options.sourceFiles,
    });
};

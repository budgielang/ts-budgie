import * as ts from "typescript";

import { visitEachComment } from "./comments/visitEachComment";
import { visitSourceFile } from "./nodes/visitSourceFile";
import { TransformationsPrinter } from "./printing/transformationsPrinter";
import { ITransformer, TransformationService } from "./service";
import { Transformer } from "./transforms";
export { GlsLine } from "./output/glsLine";
export { UnsupportedComplaint } from "./output/complaint";
export { IOutput, Transformation } from "./output/transformation";
export { IRange } from "./output/range";
export { ITransformer, TransformationService } from "./service";
export * from "./transforms";

/**
 * Options to run TS-GLS.
 */
export interface ITsGlsOptions {
    /**
     *
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Whether to visit comments in addition to content nodes.
     */
    skipComments?: boolean;

    /**
     *
     */
    sourceFiles: ts.SourceFile[];
}

/**
 * Creates a TypeScript-to-GLS code transformer.
 *
 * @returns A TypeScrip-to-GLS code transformer.
 */
export const createTransformer = (options: ITsGlsOptions) => {
    const transformers: ITransformer[] = [visitSourceFile];

    // For now, we skip comments to avoid having to resolve positioning
    if (options.skipComments === false) {
        transformers.push(visitEachComment);
    }

    return new Transformer({
        compilerOptions: options.compilerOptions,
        printer: new TransformationsPrinter(),
        service: new TransformationService(transformers),
        sourceFiles: options.sourceFiles,
    });
};

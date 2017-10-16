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
     * Whether to visit comments in addition to content nodes.
     */
    skipComments: boolean;
}

/**
 * Default options to run TS-GLS.
 */
const defaultOptions: ITsGlsOptions = {
    skipComments: true
};

/**
 * Creates a TypeScript-to-GLS code transformer.
 *
 * @returns A TypeScrip-to-GLS code transformer.
 */
export const createTransformer = (options: Partial<ITsGlsOptions> = {}) => {
    const fullOptions = { ...defaultOptions, ...options };

    const transformers: ITransformer[] = [visitSourceFile];
    if (fullOptions.skipComments !== true) {
        transformers.push(visitEachComment);
    }

    return new Transformer({
        service: new TransformationService(transformers),
        printer: new TransformationsPrinter()
    });
};

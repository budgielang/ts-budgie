import { visitEachComment } from "./comments/visitEachComment";
import { visitSourceFile } from "./nodes/visitSourceFile";
import { TransformationsPrinter } from "./printing/transformationsPrinter";
import { TransformationService } from "./service";
import { Transformer } from "./transforms";

export { GlsLine } from "./output/glsLine";
export { UnsupportedComplaint } from "./output/complaint";
export { IOutput, Transformation } from "./output/transformation";
export { IRange } from "./output/range";
export { ITransformer, TransformationService } from "./service";
export * from "./transforms";

/**
 * Creates a TypeScript-to-GLS code transformer.
 *
 * @returns A TypeScrip-to-GLS code transformer.
 */
export const createTransformer = () => new Transformer({
    service: new TransformationService([
        visitEachComment,
        visitSourceFile
    ]),
    printer: new TransformationsPrinter()
});

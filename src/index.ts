import { visitEachComment } from "./comments/visitEachComment";
import { visitSourceFile } from "./nodes/visitSourceFile";
import { TransformationsPrinter } from "./printing";
import { TransformationService } from "./service";
import { Transformer } from "./transforms";

export { GlsLine } from "./glsLine";
export { ITransformer, TransformationService } from "./service";
export { IOutput, IRange, Transformation } from "./transformation";
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

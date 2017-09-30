import { createSourceFile, ScriptTarget, SourceFile, TypeChecker } from "typescript";

import { createStubProgramForFile } from "./compiler/program";
import { GlsLine } from "./glsLine";
import { ITransformationsPrinter, TransformationsPrinter } from "./printing";
import { ITransformationService, TransformationService } from "./service";
import { Transformation } from "./transformation";

/**
 * Dependencies to initialize a new instance of the Transformer class.
 */
export interface ITransformerDependencies {
    /**
     * Prints series of transformations as lines of GLS.
     */
    printer: ITransformationsPrinter;

    /**
     * Retrieves and merges source-to-GLS transforms from a file.
     */
    service: ITransformationService;
}

/**
 * Transforms TypeScript to GLS.
 */
export class Transformer {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: ITransformerDependencies;

    /**
     * Initializes a new instance of the Transformer class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: ITransformerDependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Transforms a source file to GLS.
     *
     * @param sourceText   Source file to transform.
     * @returns GLS equivalent for the source file.
     */
    public transformSourceFile(sourceFile: SourceFile, typeChecker?: TypeChecker): (string | GlsLine)[] {
        return this.dependencies.printer.printRootTransformations(
            sourceFile.getFullText(sourceFile),
            this.getSourceFileTransforms(sourceFile, typeChecker));
    }

    /**
     * Transforms source text to GLS.
     *
     * @param sourceText   Source text to transform.
     * @returns GLS equivalent for the source text.
     */
    public transformText(sourceText: string): (string | GlsLine)[] {
        return this.dependencies.printer.printRootTransformations(
            sourceText,
            this.getTextTransforms(sourceText));
    }

    /**
     * Creates transformations for a source file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the source file.
     * @returns Transformations for the source file.
     */
    private getSourceFileTransforms(
        sourceFile: SourceFile,
        typeChecker: TypeChecker = createStubProgramForFile(sourceFile).getTypeChecker()): Transformation[] {
        return this.dependencies.service.transform(sourceFile, typeChecker);
    }

    /**
     * Creates transformations for source text.
     *
     * @param sourceText   Source text to transform.
     * @returns Transformations for the source text.
     */
    private getTextTransforms(sourceText: string): Transformation[] {
        return this.getSourceFileTransforms(
            createSourceFile("input.ts", sourceText, ScriptTarget.Latest));
    }
}

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
    printer: ITransformationsPrinter;
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
     * Creates transformations for a source file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the source file.
     * @returns Transformations for the source file.
     */
    public getSourceFileTransforms(
        sourceFile: SourceFile,
        typeChecker: TypeChecker = createStubProgramForFile(sourceFile).getTypeChecker()) {
        return this.dependencies.service.transform(sourceFile, typeChecker);
    }

    /**
     * Creates transformates for source text.
     *
     * @param sourceText   Source text to transform.
     * @returns Transformations for the source text.
     */
    public getTextTransforms(sourceText: string) {
        return this.getSourceFileTransforms(
            createSourceFile("input.ts", sourceText, ScriptTarget.Latest));
    }

    public transformSourceFile(sourceFile: SourceFile, typeChecker?: TypeChecker) {
        return this.dependencies.printer.printTransformations(
            this.getSourceFileTransforms(sourceFile, typeChecker));
    }

    public transformText(sourceText: string) {
        return this.dependencies.printer.printTransformations(this.getTextTransforms(sourceText));
    }
}

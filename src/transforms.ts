import * as ts from "typescript";

import { createProgramForFiles } from "./compiler/program";
import { Transformation } from "./output/transformation";
import { TransformationsPrinter } from "./printing/transformationsPrinter";
import { IContextOptions, TransformationService } from "./service";

/**
 * Dependencies to initialize a new instance of the Transformer class.
 */
export interface ITransformerDependencies {
    /**
     * TypeScript compiler options to transform with.
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Constant conversion options for visiting nodes.
     */
    contextOptions: IContextOptions;

    /**
     * Prints series of transformations as lines of GLS.
     */
    printer: TransformationsPrinter;

    /**
     * Retrieves and merges source-to-GLS transforms from a file.
     */
    service: TransformationService;

    /**
     * Source files that may be transformed and referenced.
     */
    sourceFiles: ts.SourceFile[];
}

/**
 * Raw and formatted results from transforming a source file.
 */
export interface ITransformationResults {
    transforms: Transformation[];
    printed: string[];
}

/**
 * Transforms TypeScript to GLS.
 */
export class Transformer {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: ITransformerDependencies;

    private readonly typeChecker: ts.TypeChecker;

    /**
     * Initializes a new instance of the Transformer class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: ITransformerDependencies) {
        this.dependencies = dependencies;
        this.typeChecker = createProgramForFiles(dependencies.sourceFiles).getTypeChecker();
    }

    /**
     * Transforms a source file to GLS.
     *
     * @param sourceText   Source file to transform.
     * @returns Raw and formatted results from transforming the source file.
     */
    public transformSourceFile(sourceFile: ts.SourceFile): ITransformationResults {
        const transforms = this.getSourceFileTransforms(sourceFile);

        return {
            printed: this.dependencies.printer.printFile(sourceFile.text, transforms),
            transforms,
        };
    }

    /**
     * Creates transformations for a source file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the source file.
     * @returns Transformations for the file, or a complaint for unsupported syntax.
     */
    private getSourceFileTransforms(sourceFile: ts.SourceFile): Transformation[] {
        return this.dependencies.service.transform({
            contextOptions: this.dependencies.contextOptions,
            sourceFile,
            typeChecker: this.typeChecker,
        });
    }
}

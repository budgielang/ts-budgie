import * as ts from "typescript";

import { createProgramForFiles } from "./compiler/program";
import { StubLanguageServiceHost } from "./compiler/stubLanguageServiceHost";
import { UnsupportedComplaint } from "./output/complaint";
import { Transformation } from "./output/transformation";
import { TransformationsPrinter } from "./printing/transformationsPrinter";
import { TransformationService } from "./service";
import { arrayToMap } from "./utils";

/**
 * Dependencies to initialize a new instance of the Transformer class.
 */
export interface ITransformerDependencies {
    /**
     * TypeScript compiler options to transform with.
     */
    compilerOptions: ts.CompilerOptions;

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
 * Extra options for text transformations.
 */
export interface ITextTransformationOptions {
    fileName: string;
    scriptTarget: ts.ScriptTarget;
}

/**
 * Default extra text transformation options.
 */
const defaultTextTransformationOptions: ITextTransformationOptions = {
    fileName: "input.ts",
    scriptTarget: ts.ScriptTarget.Latest,
};

const getSourceFileName = (sourceFile: ts.SourceFile) => sourceFile.fileName;

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
     * @returns GLS equivalent for the source file, or a complaint for unsupported syntax.
     */
    public transformSourceFile(sourceFile: ts.SourceFile): string[] {
        return this.dependencies.printer.printFile(
            sourceFile.text,
            this.getSourceFileTransforms(sourceFile));
    }

    /**
     * Creates transformations for a source file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the source file.
     * @returns Transformations for the file, or a complaint for unsupported syntax.
     */
    private getSourceFileTransforms(sourceFile: ts.SourceFile): (Transformation | UnsupportedComplaint)[] {
        return this.dependencies.service.transform(sourceFile, this.typeChecker);
    }
}

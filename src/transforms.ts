import { createSourceFile, ScriptTarget, SourceFile, TypeChecker } from "typescript";

import { createStubProgramForFile } from "./compiler/program";
import { UnsupportedComplaint } from "./output/complaint";
import { GlsLine } from "./output/glsLine";
import { Transformation } from "./output/transformation";
import { ITransformationsPrinter, TransformationsPrinter } from "./printing/transformationsPrinter";
import { ITransformationService, TransformationService } from "./service";

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
     * @returns GLS equivalent for the source file, or a complaint for unsupported syntax.
     */
    public transformSourceFile(sourceFile: SourceFile, typeChecker?: TypeChecker): (string | GlsLine)[] | UnsupportedComplaint {
        const transformed = this.getSourceFileTransforms(sourceFile, typeChecker);
        if (transformed instanceof UnsupportedComplaint) {
            return transformed;
        }

        return this.dependencies.printer.printFile(sourceFile.getFullText(sourceFile), transformed);
    }

    /**
     * Transforms source text to GLS.
     *
     * @param sourceText   Source text to transform.
     * @returns GLS equivalent for the source text, or a complaint for unsupported syntax.
     */
    public transformText(sourceText: string): (string | GlsLine)[] | UnsupportedComplaint {
        const transformed = this.getTextTransforms(sourceText);
        if (transformed instanceof UnsupportedComplaint) {
            return transformed;
        }

        return this.dependencies.printer.printFile(sourceText, transformed);
    }

    /**
     * Creates transformations for a source file.
     *
     * @param sourceFile   Source file to transform.
     * @param typeChecker   Type checker for the source file.
     * @returns Transformations for the file, or a complaint for unsupported syntax.
     */
    private getSourceFileTransforms(
        sourceFile: SourceFile,
        typeChecker: TypeChecker = createStubProgramForFile(sourceFile).getTypeChecker()): Transformation[] | UnsupportedComplaint {
        return this.dependencies.service.transform(sourceFile, typeChecker);
    }

    /**
     * Creates transformations for source text.
     *
     * @param sourceText   Source text to transform.
     * @returns Transformations for the source text, or a complaint for unsupported syntax.
     */
    private getTextTransforms(sourceText: string): Transformation[] | UnsupportedComplaint {
        return this.getSourceFileTransforms(
            createSourceFile("input.ts", sourceText, ScriptTarget.Latest));
    }
}

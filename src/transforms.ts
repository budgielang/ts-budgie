import { readFile } from "mz/fs";
import { EOL } from "os";
import { basename } from "path";
import { createSourceFile, ScriptTarget, SourceFile } from "typescript";

import { GlsLine } from "./glsLine";
import { printTransformations } from "./printing";
import { TransformationService } from "./service";
import { Transformation } from "./transformation";

const createAsyncTransformer = <TInput>(createTransforms: (input: TInput) => Promise<Transformation[]>) => {
    return async (input: TInput) => printTransformations(await createTransforms(input));
};

const createTransformer = <TInput>(createTransforms: (input: TInput) => Transformation[]) => {
    return (input: TInput) => printTransformations(createTransforms(input));
};

export const getSourceFileTransforms = (sourceFile: SourceFile) =>
    TransformationService.standard().transform(sourceFile);

export const getTextTransforms = (sourceText: string, fileName: string = "transform.ts") =>
    getSourceFileTransforms(
        createSourceFile(fileName, sourceText, ScriptTarget.Latest));

export const getLineTransforms = (sourceLines: string[], fileName?: string) =>
    getTextTransforms(sourceLines.join(EOL));

export const getFileTransforms = async (filePath: string) =>
    getTextTransforms(
        (await readFile(filePath)).toString(),
        basename(filePath));

export const transformSourceFile = createTransformer(getSourceFileTransforms);

export const transformText = createTransformer(getTextTransforms);

export const transformLine = createTransformer(getLineTransforms);

export const transformFile = createAsyncTransformer(getFileTransforms);

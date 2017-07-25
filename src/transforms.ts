import { readFile } from "mz/fs";
import { EOL } from "os";
import { basename } from "path";
import { createSourceFile, Program, ScriptTarget, SourceFile, TypeChecker } from "typescript";

import { createStubProgramForFile } from "./compiler/program";
import { GlsLine } from "./glsLine";
import { printTransformations } from "./printing";
import { TransformationService } from "./service";
import { Transformation } from "./transformation";

export const getSourceFileTransforms = (
    sourceFile: SourceFile,
    typeChecker: TypeChecker = createStubProgramForFile(sourceFile).getTypeChecker()) =>
    TransformationService.standard(typeChecker).transform(sourceFile);

export const getTextTransforms = (sourceText: string) =>
    getSourceFileTransforms(
        createSourceFile("input.ts", sourceText, ScriptTarget.Latest));

export const transformSourceFile = (sourceFile: SourceFile, typeChecker?: TypeChecker) =>
    printTransformations(getSourceFileTransforms(sourceFile, typeChecker));

export const transformText = (sourceText: string) => printTransformations(getTextTransforms(sourceText));

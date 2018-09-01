import { CaseStyle, CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine, createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const methodReturnTypeComplaint = "Could not parse method return type";

export class MethodSignatureVisitor extends NodeVisitor {
    public visit(node: ts.MethodSignature) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getTransformationContents(node)])];
    }

    private getTransformationContents(node: ts.MethodSignature): GlsLine {
        const returnType = this.aliaser.getFriendlyReturnTypeName(node);
        if (returnType === undefined) {
            return createUnsupportedGlsLine(methodReturnTypeComplaint);
        }

        const parameters = this.accumulateParameters(node.parameters);
        const nameSplit = this.nameSplitter.split(node.name.getText(this.sourceFile));
        const name = this.casing.convertToCase(CaseStyle.PascalCase, nameSplit);

        return new GlsLine(CommandNames.InterfaceMethod, name, returnType, ...parameters);
    }

    private accumulateParameters(declarations: ReadonlyArray<ts.ParameterDeclaration>): (string | GlsLine)[] {
        const parameters: (string | GlsLine)[] = [];

        for (const declaration of declarations) {
            const typeName = this.aliaser.getFriendlyTypeName(declaration);
            if (typeName === undefined) {
                return [createUnsupportedTypeGlsLine()];
            }

            parameters.push(declaration.name.getText(this.sourceFile));
            parameters.push(typeName);
        }

        return parameters;
    }
}

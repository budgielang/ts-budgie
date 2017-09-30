import { CaseStyle, CommandNames } from "general-language-syntax";
import { MethodSignature, ParameterDeclaration, SignatureKind, SyntaxKind } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class MethodSignatureVisitor extends NodeVisitor {
    public visit(node: MethodSignature) {
        const returnType = this.aliaser.getFriendlyReturnTypeName(node);
        if (returnType === undefined) {
            return undefined;
        }

        const parameters = this.accumulateParameters(node.parameters);
        if (parameters === undefined) {
            return undefined;
        }

        const nameRaw = node.name.getText(this.sourceFile);
        const name = this.casing.getConverter(CaseStyle.PascalCase).convert([nameRaw]);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.InterfaceMethod, name, returnType, ...parameters)
                ])
        ];
    }

    private accumulateParameters(declarations: ReadonlyArray<ParameterDeclaration>) {
        const parameters: (string | GlsLine)[] = [];

        for (const declaration of declarations) {
            const typeName = this.aliaser.getFriendlyTypeName(declaration);
            if (typeName === undefined) {
                return undefined;
            }

            parameters.push(declaration.name.getText(this.sourceFile));
            parameters.push(typeName);
        }

        return parameters;
    }
}

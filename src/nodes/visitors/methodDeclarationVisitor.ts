import { CaseStyle, CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { MethodDeclaration, ParameterDeclaration, SignatureKind, SyntaxKind } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class MethodDeclarationVisitor extends NodeVisitor {
    public visit(node: MethodDeclaration) {
        const returnType = this.aliaser.getFriendlyReturnTypeName(node);
        if (returnType === undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, "Could not parse method return type.");
        }

        const methodArgs = this.accumulateParameters(node.parameters);
        if (methodArgs instanceof UnsupportedComplaint) {
            return methodArgs;
        }

        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const nameSplit = this.nameSplitter.split(node.name.getText(this.sourceFile));
        const name = this.casing.convertToCase(CaseStyle.PascalCase, nameSplit);
        const parameters = [privacy, name, returnType, ...methodArgs];

        return hasModifier(node.modifiers, SyntaxKind.AbstractKeyword)
            ? this.returnAbstractTransformation(node, parameters)
            : this.returnConcreteTransformation(node, parameters);
    }

    private returnAbstractTransformation(node: MethodDeclaration, parameters: (string | GlsLine)[]) {
        if (node.body !== undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, "Non-abstract methods may not have bodies.");
        }

        if (hasModifier(node.modifiers, SyntaxKind.StaticKeyword)) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, "Static methods may not be marked abstract.");
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.MemberFunctionDeclareAbstract, ...parameters)
                ])
        ];
    }

    private returnConcreteTransformation(node: MethodDeclaration, parameters: (string | GlsLine)[]) {
        if (node.body === undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, "Non-abstract methods must have bodies.");
        }

        const bodyNodes = this.router.recurseIntoNodes(node.body.statements, node.body);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        const [commandStart, commandEnd] = this.getConcreteCommandNames(node);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(commandStart, ...parameters),
                    ...bodyNodes,
                    new GlsLine(commandEnd)
                ])
        ];
    }

    private accumulateParameters(declarations: ReadonlyArray<ParameterDeclaration>) {
        const parameters: (string | GlsLine)[] = [];

        for (const declaration of declarations) {
            const typeName = this.aliaser.getFriendlyTypeName(declaration);
            if (typeName === undefined) {
                return UnsupportedComplaint.forUnsupportedTypeNode(declaration, this.sourceFile);
            }

            parameters.push(declaration.name.getText(this.sourceFile));
            parameters.push(typeName);
        }

        return parameters;
    }

    private getConcreteCommandNames(node: MethodDeclaration) {
        return hasModifier(node.modifiers, SyntaxKind.StaticKeyword)
            ? [CommandNames.StaticFunctionDeclareStart, CommandNames.StaticFunctionDeclareEnd]
            : [CommandNames.MemberFunctionDeclareStart, CommandNames.MemberFunctionDeclareEnd];
    }
}

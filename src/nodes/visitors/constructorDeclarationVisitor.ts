import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine, createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const cannotFindClassNameComplaint = "Cannot find class name for constructor.";

const noClassNameComplaint = "Classes must have names.";

export class ConstructorDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.ConstructorDeclaration) {
        const { body, parameters } = node;
        const className = this.getParentClassName(node);
        const parsedParameters = this.parseParameters(parameters);
        const bodyChildren = this.getBodyChildren(body);
        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const bodyNodes = this.router.recurseIntoNodes(bodyChildren);

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new GlsLine(CommandNames.ConstructorStart, privacy, className, ...parsedParameters),
                ...bodyNodes,
                new GlsLine(CommandNames.ConstructorEnd),
            ]),
        ];
    }

    private getBodyChildren(body: ts.Block | undefined): ReadonlyArray<ts.Statement> {
        if (body === undefined) {
            return [];
        }

        return body.statements;
    }

    private parseParameters(parameters: ReadonlyArray<ts.ParameterDeclaration>): (string | GlsLine)[] {
        const parsedParameters: (string | GlsLine)[] = [];

        for (const parameter of parameters) {
            const name = parameter.name.getText();
            const type = this.aliaser.getFriendlyTypeName(parameter);
            if (type === undefined) {
                return [createUnsupportedTypeGlsLine()];
            }

            parsedParameters.push(name, type);
        }

        return parsedParameters;
    }

    private getParentClassName(originalNode: ts.ConstructorDeclaration, currentNode: ts.Node = originalNode): string | GlsLine {
        if (ts.isClassDeclaration(currentNode)) {
            if (currentNode.name === undefined) {
                return createUnsupportedGlsLine(noClassNameComplaint);
            }

            return currentNode.name.text;
        }

        if (currentNode.parent === undefined) {
            return createUnsupportedGlsLine(cannotFindClassNameComplaint);
        }

        return this.getParentClassName(originalNode, currentNode.parent);
    }
}

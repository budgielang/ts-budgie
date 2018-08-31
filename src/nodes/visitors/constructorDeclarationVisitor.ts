import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

const cannotFindClassNameComplaint = "Cannot find class name for constructor.";

const noClassNameComplaint = "Classes must have names.";

export class ConstructorDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.ConstructorDeclaration) {
        const { body, parameters } = node;

        const className = this.getParentClassName(node);
        if (className instanceof UnsupportedComplaint) {
            return className;
        }

        const parsedParameters = this.parseParameters(parameters);
        if (parsedParameters instanceof UnsupportedComplaint) {
            return parsedParameters;
        }

        const bodyChildren = this.getBodyChildren(body);
        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const bodyNodes = this.router.recurseIntoNodes(bodyChildren, node);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ConstructorStart, privacy, className, ...parsedParameters),
                    ...bodyNodes,
                    new GlsLine(CommandNames.ConstructorEnd),
                ])
        ];
    }

    private getBodyChildren(body: ts.Block | undefined): ReadonlyArray<ts.Statement> {
        if (body === undefined) {
            return [];
        }

        return body.statements;
    }

    private parseParameters(parameters: ReadonlyArray<ts.ParameterDeclaration>): (string | GlsLine)[] | UnsupportedComplaint {
        const parsedParameters: (string | GlsLine)[] = [];

        for (const parameter of parameters) {
            const name = parameter.name.getText();
            const type = this.aliaser.getFriendlyTypeName(parameter);
            if (type === undefined) {
                return UnsupportedComplaint.forUnsupportedTypeNode(parameter, this.sourceFile);
            }

            parsedParameters.push(name, type);
        }

        return parsedParameters;
    }

    private getParentClassName(
        originalNode: ts.ConstructorDeclaration,
        currentNode: ts.Node = originalNode,
    ): string | UnsupportedComplaint {
        if (ts.isClassDeclaration(currentNode)) {
            if (currentNode.name === undefined) {
                return UnsupportedComplaint.forNode(originalNode, this.sourceFile, noClassNameComplaint);
            }

            return currentNode.name.text;
        }

        if (currentNode.parent === undefined) {
            return UnsupportedComplaint.forNode(originalNode, this.sourceFile, cannotFindClassNameComplaint);
        }

        return this.getParentClassName(originalNode, currentNode.parent);
    }
}

import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine, createUnsupportedTypeBudgieLine } from "../../output/unsupported";
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
                new BudgieLine(CommandNames.ConstructorStart, privacy, className, ...parsedParameters),
                ...bodyNodes,
                new BudgieLine(CommandNames.ConstructorEnd),
            ]),
        ];
    }

    private getBodyChildren(body: ts.Block | undefined): ReadonlyArray<ts.Statement> {
        if (body === undefined) {
            return [];
        }

        return body.statements;
    }

    private parseParameters(parameters: ReadonlyArray<ts.ParameterDeclaration>): (string | BudgieLine)[] {
        const parsedParameters: (string | BudgieLine)[] = [];

        for (const parameter of parameters) {
            const name = parameter.name.getText();
            const type = this.aliaser.getFriendlyTypeName(parameter);
            if (type === undefined) {
                return [createUnsupportedTypeBudgieLine()];
            }

            parsedParameters.push(name, type);
        }

        return parsedParameters;
    }

    private getParentClassName(originalNode: ts.ConstructorDeclaration, currentNode: ts.Node = originalNode): string | BudgieLine {
        if (ts.isClassDeclaration(currentNode)) {
            if (currentNode.name === undefined) {
                return createUnsupportedBudgieLine(noClassNameComplaint);
            }

            return currentNode.name.text;
        }

        if (currentNode.parent === undefined) {
            return createUnsupportedBudgieLine(cannotFindClassNameComplaint);
        }

        return this.getParentClassName(originalNode, currentNode.parent);
    }
}

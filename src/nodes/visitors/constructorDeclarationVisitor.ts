import { CommandNames } from "general-language-syntax";
import { Block, ConstructorDeclaration, ParameterDeclaration, Statement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ConstructorDeclarationVisitor extends NodeVisitor {
    public visit(node: ConstructorDeclaration) {
        const { body, parameters } = node;

        const parsedParameters = this.parseParameters(parameters);
        if (parsedParameters === undefined) {
            return undefined;
        }

        const bodyChildren = this.getBodyChildren(body);
        const privacy = this.aliaser.getFriendlyPrivacyName(node);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ConstructorStart, privacy, ...parsedParameters),
                    ...this.router.recurseIntoNodes(bodyChildren),
                    new GlsLine(CommandNames.ConstructorEnd),
                ])
        ];
    }

    private getBodyChildren(body: Block | undefined): ReadonlyArray<Statement> {
        if (body === undefined) {
            return [];
        }

        return body.statements;
    }

    private parseParameters(parameters: ReadonlyArray<ParameterDeclaration>): (string | GlsLine)[] | undefined {
        const parsedParameters: (string | GlsLine)[] = [];

        for (const parameter of parameters) {
            const name = parameter.name.getText();
            const type = this.aliaser.getFriendlyTypeName(parameter);
            if (type === undefined) {
                return undefined;
            }

            parsedParameters.push(name, type);
        }

        return parsedParameters;
    }
}

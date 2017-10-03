import { CommandNames } from "general-language-syntax";
import { Block, ConstructorDeclaration, ParameterDeclaration, Statement } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ConstructorDeclarationVisitor extends NodeVisitor {
    public visit(node: ConstructorDeclaration) {
        const { body, parameters } = node;

        const parsedParameters = this.parseParameters(parameters);
        if (parsedParameters instanceof UnsupportedComplaint) {
            return parsedParameters;
        }

        const bodyChildren = this.getBodyChildren(body);
        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const bodyNodes = this.router.recurseIntoNodes(bodyChildren);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ConstructorStart, privacy, ...parsedParameters),
                    ...bodyNodes,
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

    private parseParameters(parameters: ReadonlyArray<ParameterDeclaration>): (string | GlsLine)[] | UnsupportedComplaint {
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
}

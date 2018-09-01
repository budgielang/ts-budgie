import { CaseStyle, CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class SourceFileVisitor extends NodeVisitor {
    public visit(node: ts.SourceFile) {
        const body = this.router.recurseIntoNodes(node.statements, node);

        if (body instanceof UnsupportedComplaint) {
            return body;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.FileStart, ...this.getPathComponents(node)),
                    ...body,
                    new GlsLine(CommandNames.FileEnd)
                ])
        ];
    }

    private getPathComponents(node: ts.SourceFile): string[] {
        const pathComponents = node.fileName
            .replace(".ts", "")
            .split(/\/|\\/g);

        if (pathComponents[0] === this.context.options.baseDirectory) {
            pathComponents.shift();
        }

        return pathComponents
            .map((pathComponent) => this.casing.convertToCase(CaseStyle.PascalCase, pathComponent.split(" ")));
    }
}

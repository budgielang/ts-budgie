import { CaseStyle, CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class SourceFileVisitor extends NodeVisitor {
    public visit(node: ts.SourceFile) {
        const body = this.router.recurseIntoNodes(node.statements);

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(CommandNames.FileStart, ...this.getPathComponents(node)),
                ...body,
                new BudgieLine(CommandNames.FileEnd),
            ]),
        ];
    }

    private getPathComponents(node: ts.SourceFile): string[] {
        const pathComponents = node.fileName.replace(".ts", "").split(/\/|\\/g);

        if (pathComponents[0] === this.context.options.baseDirectory) {
            pathComponents.shift();
        }

        pathComponents.unshift(this.context.options.outputNamespace);

        return pathComponents
            .filter((pathComponent) => pathComponent !== "")
            .map((pathComponent) => this.casing.convertToCase(CaseStyle.PascalCase, pathComponent.split(" ")));
    }
}

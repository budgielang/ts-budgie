import { CommandNames } from "general-language-syntax";
import { InterfaceDeclaration, SourceFile } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class InterfaceDeclarationVisitor extends NodeVisitor {
    public visit(node: InterfaceDeclaration) {
        const name = node.name.text;
        const extensions: string[] = [];

        if (node.heritageClauses !== undefined) {
            for (const clause of node.heritageClauses) {
                for (const type of clause.types) {
                    extensions.push(type.expression.getText(this.sourceFile));
                }
            }
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.InterfaceStart, name, ...extensions),
                    ...this.router.recurseIntoNodes(node.members),
                    new GlsLine(CommandNames.InterfaceEnd)
                ])
        ];
    }
}

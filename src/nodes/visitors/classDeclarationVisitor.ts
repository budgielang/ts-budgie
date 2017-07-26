import { CommandNames } from "general-language-syntax";
import { ClassDeclaration } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ClassDeclarationVisitor extends NodeVisitor {
    public visit(node: ClassDeclaration) {
        if (node.name === undefined) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ClassStart, node.name.text),
                    ...this.router.recurseIntoNodes(node.members),
                    new GlsLine(CommandNames.ClassEnd)
                ])
        ];
    }
}

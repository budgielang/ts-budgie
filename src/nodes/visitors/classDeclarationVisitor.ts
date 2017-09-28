import { CommandNames } from "general-language-syntax";
import { ClassDeclaration, SyntaxKind } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ClassDeclarationVisitor extends NodeVisitor {
    public visit(node: ClassDeclaration) {
        if (node.name === undefined) {
            return undefined;
        }

        const extensions: string[] = [];
        const implementations: string[] = [];

        if (node.heritageClauses !== undefined) {
            for (const clause of node.heritageClauses) {
                for (const type of clause.types) {
                    if (clause.token === SyntaxKind.ExtendsKeyword) {
                        extensions.push(type.expression.getText(this.sourceFile));
                    } else {
                        implementations.push(type.expression.getText(this.sourceFile));
                    }
                }
            }
        }

        const parameters = [node.name.text];

        if (extensions.length !== 0) {
            parameters.push("extends", ...extensions);
        }

        if (implementations.length !== 0) {
            parameters.push("implements", ...implementations);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ClassStart, ...parameters),
                    ...this.router.recurseIntoNodes(node.members),
                    new GlsLine(CommandNames.ClassEnd)
                ])
        ];
    }
}

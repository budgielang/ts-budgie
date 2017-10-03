import { CommandNames } from "general-language-syntax";
import { ClassDeclaration, SyntaxKind } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

const classWithoutNameComplaint = "A class must have a name.";

export class ClassDeclarationVisitor extends NodeVisitor {
    public visit(node: ClassDeclaration) {
        if (node.name === undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, classWithoutNameComplaint);
        }

        const bodyNodes = this.router.recurseIntoNodes(node.members);
        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
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
                    ...bodyNodes,
                    new GlsLine(CommandNames.ClassEnd)
                ])
        ];
    }
}

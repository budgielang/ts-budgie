import { CommandNames, KeywordNames } from "general-language-syntax";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const classWithoutNameComplaint = "A class must have a name.";

export class ClassDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.ClassDeclaration) {
        if (node.name === undefined) {
            return [
                Transformation.fromNode(
                    node,
                    this.sourceFile,
                    [
                        createUnsupportedGlsLine(classWithoutNameComplaint),
                    ]),
            ];
        }

        const bodyNodes = this.router.recurseIntoNodes(node.members);
        const extensions: string[] = [];
        const implementations: string[] = [];

        if (node.heritageClauses !== undefined) {
            for (const clause of node.heritageClauses) {
                for (const type of clause.types) {
                    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                        extensions.push(type.expression.getText(this.sourceFile));
                    } else {
                        implementations.push(type.expression.getText(this.sourceFile));
                    }
                }
            }
        }

        const parameters = [];

        if (tsutils.hasModifier(node.modifiers, ts.SyntaxKind.ExportKeyword)) {
            parameters.push(KeywordNames.Export);
        }

        if (tsutils.hasModifier(node.modifiers, ts.SyntaxKind.AbstractKeyword)) {
            parameters.push(KeywordNames.Abstract);
        }

        parameters.push(node.name.text);

        if (extensions.length !== 0) {
            parameters.push(KeywordNames.Extends, ...extensions);
        }

        if (implementations.length !== 0) {
            parameters.push(KeywordNames.Implements, ...implementations);
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

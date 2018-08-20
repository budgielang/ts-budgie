import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { operators } from "../../parsing/aliases";
import { filterOutUnsupportedComplaint } from "../../utils";
import { NodeVisitor } from "../visitor";

const unknownOperatorComplaint = "Unknown operator kind.";

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: ts.BinaryExpression) {
        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [
                Transformation.fromNode(
                    node,
                    this.sourceFile,
                    [
                        new GlsLine(
                            CommandNames.InstanceOf,
                            node.left.getText(this.sourceFile),
                            node.right.getText(this.sourceFile)),
                    ]),
            ];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [
                Transformation.fromNode(
                    node,
                    this.sourceFile,
                    [
                        new GlsLine(
                            CommandNames.DictionaryContainsKey,
                            node.left.getText(this.sourceFile),
                            node.right.getText(this.sourceFile)),
                    ]),
            ];
        }

        const contents = filterOutUnsupportedComplaint(
            this.collectOperationContents(node)
                .map((content) => this.recurseOnOperationContents(content)));
        if (contents instanceof UnsupportedComplaint) {
            return contents;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Operation, ...contents)
                ])
        ];
    }

    private collectOperationContents(node: ts.BinaryExpression): (string | GlsLine | UnsupportedComplaint)[] {
        const { left, right } = node;

        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [
                new GlsLine(
                    CommandNames.InstanceOf,
                    left.getText(this.sourceFile),
                    right.getText(this.sourceFile)),
            ];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [
                new GlsLine(
                    CommandNames.DictionaryContainsKey,
                    left.getText(this.sourceFile),
                    right.getText(this.sourceFile)),
            ];
        }

        const contents: (string | GlsLine | UnsupportedComplaint)[] = [];

        if (ts.isBinaryExpression(left)) {
            contents.push(...this.collectOperationContents(left));
        } else {
            contents.push(this.router.recurseIntoValue(left));
        }

        if (node.operatorToken.kind in operators) {
            contents.push((operators as { [i: number]: string })[node.operatorToken.kind]);
        } else {
            contents.push(UnsupportedComplaint.forNode(node, this.sourceFile, unknownOperatorComplaint));
        }

        if (ts.isBinaryExpression(right)) {
            contents.push(...this.collectOperationContents(right));
        } else {
            contents.push(this.router.recurseIntoValue(right));
        }

        return contents;
    }

    private recurseOnOperationContents(content: string | GlsLine | UnsupportedComplaint) {
        return typeof content === "string" || content instanceof GlsLine || content instanceof UnsupportedComplaint
            ? content
            : this.router.recurseIntoValue(content);
    }
}

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

    private collectOperationContents(node: ts.BinaryExpression): (string | ts.Expression | UnsupportedComplaint)[] {
        const contents: (string | ts.Expression | UnsupportedComplaint)[] = [];
        const { left, right } = node;

        if (ts.isBinaryExpression(left)) {
            contents.push(...this.collectOperationContents(left));
        } else {
            contents.push(left);
        }

        if (node.operatorToken.kind in operators) {
            contents.push((operators as { [i: number]: string })[node.operatorToken.kind]);
        } else {
            contents.push(UnsupportedComplaint.forNode(node, this.sourceFile, unknownOperatorComplaint));
        }

        if (ts.isBinaryExpression(right)) {
            contents.push(...this.collectOperationContents(right));
        } else {
            contents.push(right);
        }

        return contents;
    }

    private recurseOnOperationContents(content: string | ts.Expression | UnsupportedComplaint) {
        return typeof content === "string" || content instanceof UnsupportedComplaint
            ? content
            : this.router.recurseIntoValue(content);
    }
}

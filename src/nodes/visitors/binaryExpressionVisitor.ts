import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { operators } from "../../parsing/aliases";
import { NodeVisitor } from "../visitor";

const unknownOperatorComplaint = "Unknown operator kind.";

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: ts.BinaryExpression) {
        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [
                Transformation.fromNode(node, this.sourceFile, [
                    new GlsLine(CommandNames.InstanceOf, node.left.getText(this.sourceFile), node.right.getText(this.sourceFile)),
                ]),
            ];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [
                Transformation.fromNode(node, this.sourceFile, [
                    new GlsLine(
                        CommandNames.DictionaryContainsKey,
                        node.left.getText(this.sourceFile),
                        node.right.getText(this.sourceFile),
                    ),
                ]),
            ];
        }

        const contents = this.collectOperationContents(node).map((content) => this.recurseOnOperationContents(content));

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.Operation, ...contents)])];
    }

    private collectOperationContents(node: ts.BinaryExpression): (string | GlsLine)[] {
        const { left, right } = node;

        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [new GlsLine(CommandNames.InstanceOf, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [new GlsLine(CommandNames.DictionaryContainsKey, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        const contents: (string | GlsLine)[] = [];

        if (ts.isBinaryExpression(left)) {
            contents.push(...this.collectOperationContents(left));
        } else {
            contents.push(this.router.recurseIntoValue(left));
        }

        if (node.operatorToken.kind in operators) {
            contents.push((operators as { [i: number]: string })[node.operatorToken.kind]);
        } else {
            contents.push(new GlsLine(CommandNames.Unsupported, unknownOperatorComplaint));
        }

        if (ts.isBinaryExpression(right)) {
            contents.push(...this.collectOperationContents(right));
        } else {
            contents.push(this.router.recurseIntoValue(right));
        }

        return contents;
    }

    private recurseOnOperationContents(content: string | GlsLine) {
        return typeof content === "string" || content instanceof GlsLine ? content : this.router.recurseIntoValue(content);
    }
}

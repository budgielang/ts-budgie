import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { operators } from "../../parsing/aliases";
import { NodeVisitor } from "../visitor";

const unknownOperatorComplaint = "Unknown operator kind.";

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: ts.BinaryExpression) {
        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [
                Transformation.fromNode(node, this.sourceFile, [
                    new BudgieLine(CommandNames.InstanceOf, node.left.getText(this.sourceFile), node.right.getText(this.sourceFile)),
                ]),
            ];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [
                Transformation.fromNode(node, this.sourceFile, [
                    new BudgieLine(
                        CommandNames.DictionaryContainsKey,
                        node.left.getText(this.sourceFile),
                        node.right.getText(this.sourceFile),
                    ),
                ]),
            ];
        }

        const contents = this.collectOperationContents(node).map((content) => this.recurseOnOperationContents(content));

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Operation, ...contents)])];
    }

    private collectOperationContents(node: ts.BinaryExpression): (string | BudgieLine)[] {
        const { left, right } = node;

        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [new BudgieLine(CommandNames.InstanceOf, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [new BudgieLine(CommandNames.DictionaryContainsKey, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        const contents: (string | BudgieLine)[] = [];

        if (ts.isBinaryExpression(left)) {
            contents.push(...this.collectOperationContents(left));
        } else {
            contents.push(this.router.recurseIntoValue(left));
        }

        if (node.operatorToken.kind in operators) {
            contents.push((operators as { [i: number]: string })[node.operatorToken.kind]);
        } else {
            contents.push(new BudgieLine(CommandNames.Unsupported, unknownOperatorComplaint));
        }

        if (ts.isBinaryExpression(right)) {
            contents.push(...this.collectOperationContents(right));
        } else {
            contents.push(this.router.recurseIntoValue(right));
        }

        return contents;
    }

    private recurseOnOperationContents(content: string | BudgieLine) {
        return typeof content === "string" || content instanceof BudgieLine ? content : this.router.recurseIntoValue(content);
    }
}

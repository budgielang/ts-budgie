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

        // This gets a little complicated... but it's worth it!
        // First, we collect all the strings, lines, and transforms that need to go into this Operation command
        const contents = this.collectOperationContents(node);

        // The first line contains the actual Operation, so any regular strings and GLS sub-lines go in there
        // For example:
        // operation : 2 plus 2
        const firstLineArgs: (string | GlsLine)[] = [];
        let i: number;

        for (i = 0; i < contents.length; i += 1) {
            const content = contents[i];

            // The first line can't contain any sub-transformations, because those would need to go on the next line
            // For example:
            // operation : something equals { dictionary new start }
            //     { dictionary pair : a b }
            // dictionary new end
            // We can't add the dictionary pair to the first line, so we break once we see a new transformation section
            if (content instanceof Transformation) {
                break;
            }

            firstLineArgs.push(content);
        }

        // If there are more content transforms to add (such as with dictionary new start), check if the first line goes inline
        // Otherwise, we would put the { dictionary new start } from above on the next line. Not good.
        if (i < contents.length) {
            const content = contents[i];
            if (content instanceof Transformation && !content.output.some((output) => output instanceof Transformation)) {
                firstLineArgs.push(...(content.output as (string | GlsLine)[]));
                i += 1;
            }
        }

        const transformations = [
            i === contents.length
                ? Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.Operation, ...firstLineArgs)])
                : Transformation.fromNodeStart(node, this.sourceFile, [new GlsLine(CommandNames.OperationStart, ...firstLineArgs)]),
        ];

        // Now that we've created the first line with the actual Operation, we add any more transformations from after it
        for (i; i < contents.length; i += 1) {
            const content = contents[i];
            if (content instanceof Transformation) {
                transformations.push(content);
            }
        }

        return transformations;
    }

    private collectOperationContents(node: ts.BinaryExpression): (string | GlsLine | Transformation)[] {
        const { left, right } = node;

        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            return [new GlsLine(CommandNames.InstanceOf, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        if (node.operatorToken.kind === ts.SyntaxKind.InKeyword) {
            return [new GlsLine(CommandNames.DictionaryContainsKey, left.getText(this.sourceFile), right.getText(this.sourceFile))];
        }

        const contents: (string | GlsLine | Transformation)[] = [];

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
            contents.push(...this.router.recurseIntoNode(right));
        }

        return contents;
    }
}

import { CommandNames } from "general-language-syntax";
import { BinaryExpression, Expression, isBinaryExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { operators } from "../../parsing/aliases";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

const collectOperationContents = (node: BinaryExpression): (string | Expression)[] => {
    const contents: (string | Expression)[] = [];
    const { left, right } = node;

    if (isBinaryExpression(left)) {
        contents.push(...collectOperationContents(left));
    } else {
        contents.push(left);
    }

    contents.push(operators[node.operatorToken.kind]);

    if (isBinaryExpression(right)) {
        contents.push(...collectOperationContents(right));
    } else {
        contents.push(right);
    }

    return contents;
};

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: BinaryExpression) {
        const contents = collectOperationContents(node)
            .map((content) => this.recurseOnOperationContents(content))
            .filter((content) => content !== undefined) as (string | GlsLine)[];

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Operation, ...contents)
                ])
        ];
    }

    private recurseOnOperationContents(content: string | Expression) {
        return typeof content === "string"
            ? content
            : this.router.recurseIntoValue(content);
    }
}

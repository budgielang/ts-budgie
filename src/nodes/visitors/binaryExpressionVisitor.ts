import { CommandNames } from "general-language-syntax";
import { BinaryExpression, Expression, isBinaryExpression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { operators } from "../../parsing/aliases";
import { filterOutUnsupportedComplaint } from "../../utils";
import { NodeVisitor } from "../visitor";

const collectOperationContents = (node: BinaryExpression): (string | Expression)[] => {
    const contents: (string | Expression)[] = [];
    const { left, right } = node;

    if (isBinaryExpression(left)) {
        contents.push(...collectOperationContents(left));
    } else {
        contents.push(left);
    }

    contents.push((operators as { [i: number]: string })[node.operatorToken.kind]);

    if (isBinaryExpression(right)) {
        contents.push(...collectOperationContents(right));
    } else {
        contents.push(right);
    }

    return contents;
};

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: BinaryExpression) {
        const contents = filterOutUnsupportedComplaint(
                collectOperationContents(node)
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

    private recurseOnOperationContents(content: string | Expression) {
        return typeof content === "string"
            ? content
            : this.router.recurseIntoValue(content);
    }
}

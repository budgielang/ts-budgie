import { StringLiteral } from "typescript";

import { Transformation } from "../../output/transformation";
import { wrapWithQuotes } from "../../parsing/strings";
import { NodeVisitor } from "./../visitor";

export class StringLiteralVisitor extends NodeVisitor {
    public visit(node: StringLiteral) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    wrapWithQuotes(node.getText(this.sourceFile))
                ])
        ];
    }
}

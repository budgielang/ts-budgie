import { CommandNames } from "general-language-syntax";
import { StringLiteral } from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "./../visitor";

export class StringLiteralVisitor extends NodeVisitor {
    public visit(node: StringLiteral) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    `"${node.text}"`
                ])
        ];
    }
}

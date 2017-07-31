import { CommandNames } from "general-language-syntax";
import { StringLiteral } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
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

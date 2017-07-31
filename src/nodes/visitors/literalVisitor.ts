import { Node } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

/**
 * Transforms simple literal nodes to their text equivalents.
 */
export class LiteralVisitor extends NodeVisitor {
    public visit(node: Node) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    node.getText(this.sourceFile)
                ])
        ];
    }
}

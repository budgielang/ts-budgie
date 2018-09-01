import * as ts from "typescript";

import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

/**
 * Transforms simple literal nodes to their text equivalents.
 */
export class LiteralVisitor extends NodeVisitor {
    public visit(node: ts.Node) {
        return [Transformation.fromNode(node, this.sourceFile, [node.getText(this.sourceFile)])];
    }
}

import * as ts from "typescript";

import { Transformation } from "../../output/transformation";
import { wrapWithQuotes } from "../../parsing/strings";
import { NodeVisitor } from "../visitor";

export class SuperKeywordVisitor extends NodeVisitor {
    public visit(node: ts.Expression) {
        return [Transformation.fromNode(node, this.sourceFile, [wrapWithQuotes(node.getText(this.sourceFile))])];
    }
}

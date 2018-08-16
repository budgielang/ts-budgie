import { CallExpression } from "typescript";

import { NodeVisitor } from "../visitor";

export class CallExpressionVisitor extends NodeVisitor {
    public visit(node: CallExpression) {
        return this.router.recurseIntoNode(node.expression);
    }
}

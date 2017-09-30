import { CommandNames } from "general-language-syntax";
import { CallExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { operators } from "../../parsing/aliases";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class CallExpressionVisitor extends NodeVisitor {
    public visit(node: CallExpression) {
        return this.router.recurseIntoNode(node.expression);
    }
}

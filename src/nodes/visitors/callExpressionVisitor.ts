import { CallExpression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class CallExpressionVisitor extends NodeVisitor {
    public visit(node: CallExpression) {
        return this.router.recurseIntoNode(node.expression);
    }
}

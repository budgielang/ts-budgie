import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ThisExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ThisExpression) {
        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.This)])];
    }
}

import { CommandNames } from "general-language-syntax";
import { ThisExpression } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class ThisExpressionVisitor extends NodeVisitor {
    public visit(node: ThisExpression) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.This)
                ])
        ];
    }
}
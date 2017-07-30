import { CommandNames } from "general-language-syntax";
import { BreakStatement } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class BreakStatementVisitor extends NodeVisitor {
    public visit(node: BreakStatement) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Break)
                ])
        ];
    }
}
import { CommandNames } from "general-language-syntax";
import { ContinueStatement } from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ContinueStatementVisitor extends NodeVisitor {
    public visit(node: ContinueStatement) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.Continue)
                ])
        ];
    }
}

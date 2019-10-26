import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class ContinueStatementVisitor extends NodeVisitor {
    public visit(node: ts.ContinueStatement) {
        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.Continue)])];
    }
}

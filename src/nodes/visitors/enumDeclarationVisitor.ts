import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class EnumDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.EnumDeclaration) {
        const bodyNodes = this.router.recurseIntoNodes(node.members);
        const name = node.name.text;

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(CommandNames.EnumStart, name),
                ...bodyNodes,
                new BudgieLine(CommandNames.EnumEnd),
            ]),
        ];
    }
}

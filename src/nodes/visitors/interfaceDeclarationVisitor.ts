import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class InterfaceDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.InterfaceDeclaration) {
        const bodyNodes = this.router.recurseIntoNodes(node.members);
        const name = node.name.text;
        const extensions: string[] = [];

        if (node.heritageClauses !== undefined) {
            for (const clause of node.heritageClauses) {
                for (const type of clause.types) {
                    extensions.push(type.expression.getText(this.sourceFile));
                }
            }
        }

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new BudgieLine(CommandNames.InterfaceStart, name, ...extensions),
                ...bodyNodes,
                new BudgieLine(CommandNames.InterfaceEnd),
            ]),
        ];
    }
}

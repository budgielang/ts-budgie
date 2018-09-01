import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class WhileStatementVisitor extends NodeVisitor {
    public visit(node: ts.WhileStatement) {
        const expression = this.router.recurseIntoValue(node.expression);
        const transformations: Transformation[] = [];
        const { statement } = node;
        const thenBody = this.router.recurseIntoNode(statement);

        transformations.push(...thenBody);

        return [
            Transformation.fromNode(node, this.sourceFile, [
                new GlsLine(CommandNames.WhileStart, expression),
                ...transformations,
                new GlsLine(CommandNames.WhileEnd),
            ]),
        ];
    }
}

import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { printTransformations } from "../printing";
import { Transformation } from "../transformation";
import { visitNode } from "./visitNode";

const finalTextNodes = new Set<SyntaxKind>([
    SyntaxKind.FirstLiteralToken,
    SyntaxKind.Identifier,
    SyntaxKind.StringLiteral,
]);

export abstract class NodeVisitor {
    public abstract visit(node: Node, sourceFile: SourceFile, typeChecker: TypeChecker): Transformation[] | undefined;

    protected recurseOnValue(node: Node, sourceFile: SourceFile, typeChecker: TypeChecker): string | GlsLine {
        if (finalTextNodes.has(node.kind)) {
            return node.getText(sourceFile);
        }

        const subTransformations = visitNode(node, sourceFile, typeChecker);
        if (subTransformations === undefined) {
            return "";
        }

        return printTransformations(subTransformations)[0];
    }
}

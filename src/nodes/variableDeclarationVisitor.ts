import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { SourceFile, SyntaxKind, TypeChecker, VariableDeclaration } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";
import { NodeVisitor } from "./visitor";

const getType = (node: VariableDeclaration, typeChecker: TypeChecker) =>
    (typeChecker.getTypeAtLocation(node) as any).intrinsicName;

const getValue = (node: VariableDeclaration, sourceFile: SourceFile) => {
    return node.initializer === undefined
        ? undefined
        : node.initializer.getText(sourceFile);
};

export class VariableDeclarationVisitor extends NodeVisitor {
    public visit(node: VariableDeclaration, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const name = node.name.getText(sourceFile);
        const type = getType(node, typeChecker);

        if (type === undefined) {
            return undefined;
        }

        const value = getValue(node, sourceFile);

        const results = [name, type];
        if (value !== undefined) {
            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.Variable, ...results)
                ])
        ];
    }
}

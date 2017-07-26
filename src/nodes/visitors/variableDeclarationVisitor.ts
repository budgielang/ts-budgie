import { CommandNames } from "general-language-syntax";
import { SourceFile, SyntaxKind, TypeChecker, VariableDeclaration } from "typescript";

import { GlsLine } from "../../glsLine";
import { getTypeAlias } from "../../parsing/aliases";
import { isVariableDeclarationMultiline } from "../../parsing/attributes";
import { getNodeTypeName } from "../../parsing/names";
import { Transformation } from "../../transformation";
import { visitNode, visitNodes } from "../visitNode";
import { NodeVisitor } from "../visitor";

const getLocalNodeTypeName = (node: VariableDeclaration, sourceFile: SourceFile, typeChecker: TypeChecker) => {
    if (node.type === undefined) {
        return getNodeTypeName(node, typeChecker);
    }

    const quickType = getNodeTypeName(node.type, typeChecker);
    if (quickType !== undefined) {
        return quickType;
    }

    const deepType = visitNode(node.type, sourceFile, typeChecker);
    if (deepType === undefined) {
        return undefined;
    }

    if (deepType[0] !== undefined) {
        return deepType[0].output[0] as GlsLine;
    }

    if (node.initializer === undefined) {
        return undefined;
    }

    return getTypeAlias(node.type.getText(sourceFile));
};

export class VariableDeclarationVisitor extends NodeVisitor {
    public visit(node: VariableDeclaration, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const name = node.name.getText(sourceFile);
        const type = getLocalNodeTypeName(node, sourceFile, typeChecker);
        if (type === undefined) {
            return undefined;
        }

        const command = isVariableDeclarationMultiline(node, sourceFile)
            ? CommandNames.VariableStart
            : CommandNames.Variable;

        const value = this.getValue(node, sourceFile, typeChecker);

        const results = [name, type];
        if (value !== undefined) {
            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(command, ...results)
                ])
        ];
    }

    private getValue(node: VariableDeclaration, sourceFile: SourceFile, typeChecker: TypeChecker) {
        return node.initializer === undefined
            ? undefined
            : this.recurseOnValue(node.initializer, sourceFile, typeChecker);
    }
}

import { CommandNames } from "general-language-syntax";
import { SourceFile, SyntaxKind, TypeChecker, VariableDeclaration } from "typescript";
import * as ts from "typescript";

import { GlsLine } from "../../glsLine";
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

    return deepType[0].output[0] as GlsLine;
};

const getValue = (node: VariableDeclaration, sourceFile: SourceFile) => {
    return node.initializer === undefined
        ? undefined
        : node.initializer.getText(sourceFile);
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
                    new GlsLine(command, ...results)
                ])
        ];
    }
}

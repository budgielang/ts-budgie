import { CommandNames } from "general-language-syntax";
import { VariableDeclaration } from "typescript";

import { GlsLine } from "../../glsLine";
import { getTypeAlias } from "../../parsing/aliases";
import { isVariableDeclarationMultiline } from "../../parsing/attributes";
import { getNodeTypeName } from "../../parsing/names";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class VariableDeclarationVisitor extends NodeVisitor {
    public visit(node: VariableDeclaration) {
        const name = node.name.getText(this.sourceFile);
        const type = this.getLocalNodeTypeName(node);
        if (type === undefined) {
            return undefined;
        }

        const command = isVariableDeclarationMultiline(node, this.sourceFile)
            ? CommandNames.VariableStart
            : CommandNames.Variable;

        const value = this.getValue(node);

        const results = [name, type];
        if (value !== undefined) {
            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(command, ...results)
                ])
        ];
    }

    private getValue(node: VariableDeclaration) {
        return node.initializer === undefined
            ? undefined
            : this.router.recurseIntoValue(node.initializer);
    }

    private getLocalNodeTypeName(node: VariableDeclaration) {
        if (node.type === undefined) {
            return getNodeTypeName(node, this.typeChecker);
        }

        const quickType = getNodeTypeName(node.type, this.typeChecker);
        if (quickType !== undefined) {
            return quickType;
        }

        const deepType = this.router.recurseIntoNode(node.type);
        if (deepType === undefined) {
            return undefined;
        }

        if (deepType[0] !== undefined) {
            return deepType[0].output[0] as GlsLine;
        }

        if (node.initializer === undefined) {
            return undefined;
        }

        return getTypeAlias(node.type.getText(this.sourceFile));
    }
}

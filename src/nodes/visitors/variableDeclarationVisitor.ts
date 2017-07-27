import { CommandNames } from "general-language-syntax";
import { VariableDeclaration } from "typescript";

import { GlsLine } from "../../glsLine";
import { isVariableDeclarationMultiline } from "../../parsing/attributes";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class VariableDeclarationVisitor extends NodeVisitor {
    public visit(node: VariableDeclaration) {
        const name = node.name.getText(this.sourceFile);
        let interpretedType = this.aliaser.getFriendlyTypeNameForNode(node);

        const command = isVariableDeclarationMultiline(node, this.sourceFile)
            ? CommandNames.VariableStart
            : CommandNames.Variable;

        if (interpretedType !== undefined) {
            this.context.setTypeCoercion(interpretedType);
        }

        const value = this.getValue(node);
        const typeModified = this.context.exitTypeCoercion()!;
        if (typeModified !== undefined) {
            interpretedType = typeModified;
        }

        const results: (string | GlsLine)[] = [name, interpretedType];
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
}

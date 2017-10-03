import { CommandNames } from "general-language-syntax";
import { VariableDeclaration } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { isVariableDeclarationMultiline } from "../../parsing/attributes";
import { getTypeAdjustment } from "../adjustments/types";
import { NodeVisitor } from "../visitor";

export class VariableDeclarationVisitor extends NodeVisitor {
    public visit(node: VariableDeclaration) {
        const name = node.name.getText(this.sourceFile);
        let interpretedType = this.aliaser.getFriendlyTypeName(node);

        const command = isVariableDeclarationMultiline(node, this.sourceFile)
            ? CommandNames.VariableStart
            : CommandNames.Variable;

        // If we have a type, tell the value parser to use it
        // This is necessary for some commands, such as lists
        if (interpretedType !== undefined) {
            this.context.setTypeCoercion(interpretedType);
        }

        // A value may indicate to us better typing info than what we already have
        const value = this.getValue(node);
        if (value instanceof UnsupportedComplaint) {
            return value;
        }

        const typeModified = this.context.exitTypeCoercion();
        if (typeModified !== undefined) {
            interpretedType = typeModified;
        }

        // Some values may request a more specific intepreted type,
        // such as length commands switching from "float" to "int"
        if (value !== undefined) {
            const manualTypeAdjustment = getTypeAdjustment(interpretedType, value);
            if (manualTypeAdjustment !== undefined) {
                interpretedType = manualTypeAdjustment;
            }
        }

        // If we don't know the interpreted type by now, just give up
        if (interpretedType === undefined) {
            return UnsupportedComplaint.forNode(
                node,
                this.sourceFile,
                "Could not determine type information.");
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

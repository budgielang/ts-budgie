import { CommandNames } from "general-language-syntax";
import { SyntaxKind, VariableDeclaration } from "typescript";

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

        // If we have a type, tell the value parser to use it
        // This is necessary for some commands, such as lists
        if (interpretedType !== undefined) {
            this.context.setTypeCoercion(interpretedType);
        }

        // A value may indicate to us better typing info than what we already have
        const aliasedValue = this.getAliasedValue(node);
        if (aliasedValue instanceof UnsupportedComplaint) {
            return aliasedValue;
        }

        const typeModified = this.context.exitTypeCoercion();
        if (typeModified !== undefined) {
            interpretedType = typeModified;
        }

        // Some values may request a more specific intepreted type,
        // such as length commands switching from "float" to "int"
        const manualTypeAdjustment = getTypeAdjustment({
            originalType: interpretedType,
            actualValue: aliasedValue,
            node,
        });
        if (manualTypeAdjustment !== undefined) {
            interpretedType = manualTypeAdjustment;
        }

        // If we don't know the interpreted type by now, just give up
        if (interpretedType === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        const firstResultsLineArgs: (string | GlsLine)[] = [name, interpretedType];
        if (aliasedValue !== undefined) {
            firstResultsLineArgs.push(aliasedValue);
        }

        const lines: (string | GlsLine | Transformation)[] = [];
        const command = isVariableDeclarationMultiline(node, this.sourceFile)
            ? CommandNames.VariableStart
            : CommandNames.Variable;

        if (command === CommandNames.VariableStart) {
            const fullValue = this.getFullValue(node);
            if (fullValue instanceof UnsupportedComplaint) {
                return fullValue;
            }

            if (fullValue !== undefined) {
                this.appendFullValueToLines(fullValue, lines);
            }
        }

        lines.unshift(new GlsLine(command, ...firstResultsLineArgs));

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                lines)
        ];
    }

    private getAliasedValue(node: VariableDeclaration) {
        if (node.initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoValue(node.initializer);
    }

    private getFullValue(node: VariableDeclaration) {
        if (node.initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoNode(node.initializer);
    }

    private appendFullValueToLines(fullValue: (string | Transformation | GlsLine)[], lines: (string | GlsLine | Transformation)[]) {
        // Full values start with "dictionary new start" or similar commands.
        // This filters them out.
        if (fullValue.length === 1 && fullValue[0] instanceof Transformation) {
            this.appendFullValueToLines((fullValue[0] as Transformation).output, lines);
            return;
        }

        lines.push(...fullValue.slice(1));
    }
}

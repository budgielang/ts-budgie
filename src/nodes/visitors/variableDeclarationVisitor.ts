import { CommandNames, KeywordNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { TypeAdjuster } from "../adjustments/types";
import { NodeVisitor } from "../visitor";

interface IIntrinsicType extends ts.Type {
    /**
     * @remarks This is private within TypeScript, and might change in the future.
     */
    intrinsicName: string;
}

/**
 * For very obvious types, we allow direct typeChecker usage to get simple names.
 */
const allowedIntrinsicNames = new Set([
    KeywordNames.String,
    "boolean", "number", "string",
]);

/**
 * Command names that indicate a variable needs to start and end with separate commands.
 */
const multilineInitializerTypes = new Set([
    CommandNames.DictionaryNewStart,
]);

/**
 * @returns Whether a variable declaration is of a type that has a Start and corresponding End.
 */
const isInitializerMultilineNecessary = (initializerType: string | GlsLine | undefined) => {
    if (!(initializerType instanceof GlsLine)) {
        return false;
    }

    return multilineInitializerTypes.has(initializerType.command);
};

export class VariableDeclarationVisitor extends NodeVisitor {
    /**
     * Tries to find more specific types for variable declarations.
     */
    private readonly typeAdjuster = new TypeAdjuster();

    public visit(node: ts.VariableDeclaration) {
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

        // After recursing into the node, see if we've found a more specific type (coercion)
        const typeModified = this.context.exitTypeCoercion();
        if (typeModified !== undefined) {
            interpretedType = typeModified;
        }

        // Some values may request a more specific intepreted type,
        // such as length commands switching from "float" to "int"
        const manualTypeAdjustment = this.typeAdjuster.attempt({
            originalType: interpretedType,
            actualValue: aliasedValue,
            node,
        });
        if (manualTypeAdjustment !== undefined) {
            interpretedType = manualTypeAdjustment;
        }

        // By now, we've finished doing fancy checks, but the type checker might just directly know
        if (interpretedType === undefined) {
            interpretedType = this.getFriendlyTypeAtLocation(node);
        }

        // As a last ditch effort, it may be that we're seeing the result of a GLS line
        // If it's a command that we explicitly know to return a type, we can use that
        if (interpretedType === undefined && aliasedValue instanceof GlsLine) {
            interpretedType = this.typeAdjuster.getKnownTypeOfGlsLine(aliasedValue);
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
        const command = isInitializerMultilineNecessary(firstResultsLineArgs[2])
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

    private getAliasedValue(node: ts.VariableDeclaration) {
        if (node.initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoValue(node.initializer);
    }

    private getFullValue(node: ts.VariableDeclaration) {
        if (node.initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoNode(node.initializer);
    }

    private getFriendlyTypeAtLocation(node: ts.VariableDeclaration): string | undefined {
        const { intrinsicName } = this.typeChecker.getTypeAtLocation(node) as IIntrinsicType;

        return allowedIntrinsicNames.has(intrinsicName)
            ? intrinsicName
            : undefined;
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

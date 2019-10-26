import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";

import { LengthCommandTypeAdjustmentChecker } from "./typeAdjustments/lengthCommandTypeAdjustmentChecker";

export interface ITypeAdjustmentAttemptInfo {
    /**
     * Friendly type of the node's value, if immediately available.
     */
    actualValue?: string | BudgieLine;

    /**
     * Variable declaration node.
     */
    node: ts.VariableDeclaration;

    /**
     * Original friendly type name of the node.
     */
    originalType: string | BudgieLine | undefined;
}

/**
 * Tries to find more specific types for variable declarations.
 */
export interface ITypeAdjustmentChecker {
    /**
     * Tries to find a more specific type for a variable declaration.
     *
     * @param info   Info on the variable declaration.
     * @returns More specific type for the variable declaration, if available.
     */
    attempt(info: ITypeAdjustmentAttemptInfo): string | BudgieLine | undefined;
}

/**
 * Budgie commands with known return types, keyed to those return types.
 */
const knownBudgieLineTypes = new Map<string, string>([
    [CommandNames.StringCaseLower, "string"],
    [CommandNames.StringCaseUpper, "string"],
    [CommandNames.StringFormat, "string"],
    [CommandNames.StringIndexOf, "string"],
    [CommandNames.StringLength, "int"],
    [CommandNames.StringSubstringIndex, "string"],
    [CommandNames.StringSubstringLength, "string"],
    [CommandNames.StringTrim, "string"],
]);

/**
 * Tries to find more specific types for variable declarations.
 */
export class TypeAdjuster implements ITypeAdjustmentChecker {
    private readonly checkers = [new LengthCommandTypeAdjustmentChecker()];

    /**
     * Tries to find a more specific type for a variable declaration.
     *
     * @param info   Info on the variable declaration.
     * @returns More specific type for the variable declaration, if available.
     */
    public attempt(info: ITypeAdjustmentAttemptInfo): BudgieLine | string | undefined {
        for (const checker of this.checkers) {
            const adjustedType = checker.attempt(info);
            if (adjustedType !== undefined) {
                return adjustedType;
            }
        }

        return undefined;
    }

    /**
     * Tries to find a more specific type based on a known Budgie command.
     *
     * @param line   Budgie command line.
     * @returns Known type of that command line, if available.
     */
    public getKnownTypeOfBudgieLine(line: BudgieLine): string | undefined {
        return knownBudgieLineTypes.get(line.command);
    }
}

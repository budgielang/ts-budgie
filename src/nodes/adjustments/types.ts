import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { LengthCommandTypeAdjustmentChecker } from "./typeAdjustments/lengthCommandTypeAdjustmentChecker";

export interface ITypeAdjustmentAttemptInfo {
    /**
     * Friendly type of the node's value, if immediately available.
     */
    actualValue?: string | GlsLine;

    /**
     * Variable declaration node.
     */
    node: ts.VariableDeclaration;

    /**
     * Original friendly type name of the node.
     */
    originalType: string | GlsLine | undefined;
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
    attempt(info: ITypeAdjustmentAttemptInfo): string | GlsLine | undefined;
}

/**
 * Tries to find more specific types for variable declarations.
 */
export class TypeAdjuster implements ITypeAdjustmentChecker {
    private readonly checkers = [
        new LengthCommandTypeAdjustmentChecker(),
    ];

    /**
     * Tries to find a more specific type for a variable declaration.
     *
     * @param info   Info on the variable declaration.
     * @returns More specific type for the variable declaration, if available.
     */
    public attempt(info: ITypeAdjustmentAttemptInfo): GlsLine | string | undefined {
        for (const checker of this.checkers) {
            const adjustedType = checker.attempt(info);
            if (adjustedType !== undefined) {
                return adjustedType;
            }
        }

        return undefined;
    }
}

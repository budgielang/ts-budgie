import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { FloatToIntTypeAdjustmentChecker } from "./typeAdjustments/floatToIntTypeAdjustmentChecker";
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

export interface ITypeAdjustmentChecker {
    attempt(info: ITypeAdjustmentAttemptInfo): string | GlsLine | undefined;
}

const checkers = [
    new LengthCommandTypeAdjustmentChecker(),
    new FloatToIntTypeAdjustmentChecker(),
];

/**
 * Tries to find a more specific type for a variable declaration.
 *
 * @param info   Info on the variable declaration.
 * @returns More specific type for the variable declaration, if available.
 */
export const getTypeAdjustment = (info: ITypeAdjustmentAttemptInfo): GlsLine | string | undefined => {
    for (const checker of checkers) {
        const adjustedType = checker.attempt(info);
        if (adjustedType !== undefined) {
            return adjustedType;
        }
    }

    return undefined;
};

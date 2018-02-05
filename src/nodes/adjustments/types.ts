import * as tsutils from "tsutils";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { RootAliaser } from "../../parsing/aliasers/rootAliaser";
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
    private readonly aliaser: RootAliaser;
    private readonly checkers: ITypeAdjustmentChecker[];
    private readonly variableUsage: Map<ts.Identifier, tsutils.VariableInfo>;

    public constructor(aliaser: RootAliaser, variableUsage: Map<ts.Identifier, tsutils.VariableInfo>) {
        this.aliaser = aliaser;
        this.variableUsage = variableUsage;

        this.checkers = [
            new LengthCommandTypeAdjustmentChecker(),
            new FloatToIntTypeAdjustmentChecker(aliaser, this.variableUsage),
        ];
    }

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

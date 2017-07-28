import { GlsLine } from "../../glsLine";
import { LengthCommandTypeAdjustmentChecker } from "./typeAdjustments/lengthCommandTypeAdjustmentChecker";

export interface ITypeAdjustmentChecker {
    attempt(originalType: string | GlsLine | undefined, actualValue: string | GlsLine): string | GlsLine | undefined;
}

const checkers = [
    new LengthCommandTypeAdjustmentChecker()
];

export const getTypeAdjustment = (originalType: string | GlsLine | undefined, actualValue: string | GlsLine) => {
    for (const checker of checkers) {
        const adjustedType = checker.attempt(originalType, actualValue);
        if (adjustedType !== undefined) {
            return adjustedType;
        }
    }

    return undefined;
};

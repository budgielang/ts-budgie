import { CommandNames } from "general-language-syntax";

import { GlsLine } from "../../../glsLine";
import { ITypeAdjustmentChecker } from "../types";

const lengthCommands = new Set([
    CommandNames.ArrayLength,
    CommandNames.ListLength,
    CommandNames.StringLength,
]);

export class LengthCommandTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    public attempt(originalType: string | GlsLine | undefined, actualValue: string | GlsLine): string | GlsLine | undefined {
        if (originalType !== "float" || typeof actualValue === "string") {
            return undefined;
        }

        const { command } = actualValue;
        if (!lengthCommands.has(command)) {
            return undefined;
        }

        return "int";
    }
}

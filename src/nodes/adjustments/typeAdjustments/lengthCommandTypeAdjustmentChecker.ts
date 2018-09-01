import { CommandNames } from "general-language-syntax";

import { GlsLine } from "../../../output/glsLine";
import { ITypeAdjustmentAttemptInfo, ITypeAdjustmentChecker } from "../types";

const lengthCommands = new Set([CommandNames.ArrayLength, CommandNames.ListLength, CommandNames.StringLength]);

export class LengthCommandTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    public attempt(info: ITypeAdjustmentAttemptInfo): string | GlsLine | undefined {
        if (!(info.actualValue instanceof GlsLine) || info.originalType !== "float") {
            return undefined;
        }

        const { command } = info.actualValue;
        if (!lengthCommands.has(command)) {
            return undefined;
        }

        return "int";
    }
}

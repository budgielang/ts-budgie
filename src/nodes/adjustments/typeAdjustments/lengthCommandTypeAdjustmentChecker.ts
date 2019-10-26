import { CommandNames } from "budgie";

import { BudgieLine } from "../../../output/budgieLine";
import { ITypeAdjustmentAttemptInfo, ITypeAdjustmentChecker } from "../types";

const lengthCommands = new Set([CommandNames.ArrayLength, CommandNames.ListLength, CommandNames.StringLength]);

export class LengthCommandTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    public attempt(info: ITypeAdjustmentAttemptInfo): string | BudgieLine | undefined {
        if (!(info.actualValue instanceof BudgieLine) || info.originalType !== "float") {
            return undefined;
        }

        const { command } = info.actualValue;
        if (!lengthCommands.has(command)) {
            return undefined;
        }

        return "int";
    }
}

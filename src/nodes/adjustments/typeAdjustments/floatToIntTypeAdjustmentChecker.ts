import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { ITypeAdjustmentAttemptInfo, ITypeAdjustmentChecker } from "../types";

export class FloatToIntTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    public attempt(info: ITypeAdjustmentAttemptInfo): string | GlsLine | undefined {
        return undefined;
    }
}

import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { ITypeAdjustmentChecker } from "../types";

export class FloatToIntTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    public attempt(originalType: string | GlsLine | undefined, actualValue: string | GlsLine): string | GlsLine | undefined {
        return undefined;
    }
}

import { GlsLine } from "../output/glsLine";

export type NumericType = "float" | "int";

export const isNumericTypeName = (type: string): type is NumericType => type === "float" || type === "int";

export const getNumericTypeNameFromUsages = (usages: (number | string | GlsLine)[]): NumericType => {
    for (const usage of usages) {
        if (usage instanceof GlsLine) {
            continue;
        }

        if (typeof usage === "number") {
            if (usage % 1 !== 0) {
                return "float";
            }
        } else if (usage.indexOf(".") !== -1) {
            return "float";
        }
    }

    return "int";
};

import { BudgieLine } from "../output/budgieLine";

export type NumericType = "float" | "int";

export const isNumericTypeName = (type: string): type is NumericType => type === "float" || type === "int";

export const getNumericTypeNameFromUsages = (usages: (number | string | BudgieLine)[]): NumericType => {
    for (const usage of usages) {
        if (usage instanceof BudgieLine) {
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

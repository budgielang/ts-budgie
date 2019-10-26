import { BudgieLine } from "../output/budgieLine";

export const getListValueType = (typeCommand: string | BudgieLine) => (typeof typeCommand === "string" ? typeCommand : typeCommand.args[0]);

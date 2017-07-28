import { GlsLine } from "../glsLine";

export const getListValueType = (typeCommand: string | GlsLine) =>
    typeof typeCommand === "string"
        ? typeCommand
        : typeCommand.args[0];

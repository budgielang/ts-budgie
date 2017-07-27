import { GlsLine } from "../glsLine";

export const getListValueType = (typeCommand: string | GlsLine) => {
    return typeof typeCommand === "string"
        ? typeCommand
        : typeCommand.args[0];
};

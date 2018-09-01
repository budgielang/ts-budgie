import { CommandNames } from "general-language-syntax";

import { GlsLine } from "../output/glsLine";

/**
 * Parses a raw TypeScript type name into the GLS command equivalent.
 *
 * @param typeRaw   A raw TypeScript type.
 * @returns The GLS command equivalent for the type.
 */
export const parseRawTypeToGls = (typeRaw: string): string | GlsLine => {
    const angleBracketIndex = typeRaw.lastIndexOf("<");
    if (angleBracketIndex !== -1) {
        return new GlsLine(CommandNames.GenericType, parseRawTypeToGls(typeRaw.substring(0, angleBracketIndex)));
    }

    const arrayBracketIndex = typeRaw.lastIndexOf("[");
    if (arrayBracketIndex !== -1) {
        return new GlsLine(CommandNames.ListType, parseRawTypeToGls(typeRaw.substring(0, arrayBracketIndex)));
    }

    return typeRaw;
};

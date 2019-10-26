import { CommandNames } from "budgie";

import { BudgieLine } from "../output/budgieLine";

/**
 * Parses a raw TypeScript type name into the Budgie command equivalent.
 *
 * @param typeRaw   A raw TypeScript type.
 * @returns The Budgie command equivalent for the type.
 */
export const parseRawTypeToBudgie = (typeRaw: string): string | BudgieLine => {
    const angleBracketIndex = typeRaw.lastIndexOf("<");
    if (angleBracketIndex !== -1) {
        return new BudgieLine(CommandNames.GenericType, parseRawTypeToBudgie(typeRaw.substring(0, angleBracketIndex)));
    }

    const arrayBracketIndex = typeRaw.lastIndexOf("[");
    if (arrayBracketIndex !== -1) {
        return new BudgieLine(CommandNames.ListType, parseRawTypeToBudgie(typeRaw.substring(0, arrayBracketIndex)));
    }

    return typeRaw;
};

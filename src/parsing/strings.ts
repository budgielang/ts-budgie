/**
 * Converts text for a string to Budgie-compatible quotes.
 *
 * @param text   Text that needs to be quote-wrapped.
 * @returns Budgie-compatible quote-wrapped version of the text.
 */
export const wrapWithQuotes = (text: string): string => {
    if (text[0] === '"') {
        return text;
    }

    if (text[0] === "'" || text[0] === "`") {
        return `"${text.slice(1, text.length - 2)}"`;
    }

    return `"${text}"`;
};

/**
 * Filters out undefined elements from a potentially undefined array.
 *
 * @param array   Array of potentially undefined elements.
 * @returns Either undefined if the array has an undefined element, or the array.
 */
export const filterOutUndefined = <T>(array: (T | undefined)[]): T[] | undefined => {
    for (const element of array) {
        if (element === undefined) {
            return undefined;
        }
    }

    return array as T[];
};

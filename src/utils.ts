import { UnsupportedComplaint } from "./output/complaint";

/**
 * Filters out UnsupportedComplaint elements from an array.
 *
 * @param array   Array of potentially undefined elements.
 * @returns Either the first UnsupportedComplaint if the array has one, or the array.
 */
export const filterOutUnsupportedComplaint = <T>(array: (T | UnsupportedComplaint)[]): T[] | UnsupportedComplaint => {
    for (const element of array) {
        if (element instanceof UnsupportedComplaint) {
            return element;
        }
    }

    return array as T[];
};

export const arrayToMap = <TKey, TValue>(
    values: TValue[],
    getKey: (value: TValue) => TKey,
): Map<TKey, TValue> => {
    const result = new Map();

    for (const value of values) {
        result.set(getKey(value), value);
    }

    return result;
};

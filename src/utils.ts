import * as tsutils from "tsutils";
import * as ts from "typescript";

import { IReturningNode } from "./nodes/aliaser";
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

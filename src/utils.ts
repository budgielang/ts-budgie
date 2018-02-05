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

export const findReturnsStatementsOfFunction = (returningNode: IReturningNode): ts.ReturnStatement[] => {
    const returnStatements: ts.ReturnStatement[] = [];

    const walk = (node: ts.Node) => {
        if (tsutils.isFunctionScopeBoundary(node)) {
            return;
        }

        if (ts.isReturnStatement(node)) {
            returnStatements.push(node);
        }

        ts.forEachChild(node, walk);
    };

    ts.forEachChild(returningNode, walk);

    return returnStatements;
};

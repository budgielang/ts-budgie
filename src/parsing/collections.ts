import { Expression, NodeArray, TypeChecker } from "typescript";

import { getNodeTypeName } from "./names";

export const getCommonTypes = (elements: Expression[], typeChecker: TypeChecker) => {
    if (elements.length === 0) {
        return "object";
    }

    const firstType = getNodeTypeName(elements[0], typeChecker);

    for (let i = 1; i < elements.length; i += 1) {
        if (getNodeTypeName(elements[i], typeChecker) !== firstType) {
            return "object";
        }
    }

    return firstType;
};

import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../output/glsLine";
import { IRecurseOntoNode } from "./aliasers/recursiveAliaser";

const getParameterValueType = (typeMember: ts.IndexSignatureDeclaration, recurseOntoNode: IRecurseOntoNode) => {
    if (typeMember.type === undefined) {
        return undefined;
    }

    return recurseOntoNode(typeMember.type);
};

export const getDictionaryTypeNameFromNode = (node: ts.TypeLiteralNode, recurseOntoNode: IRecurseOntoNode) => {
    const typeMember = node.members[0];
    if (!ts.isIndexSignatureDeclaration(typeMember)) {
        return undefined;
    }

    const valueType = getParameterValueType(typeMember, recurseOntoNode);
    if (valueType === undefined) {
        return undefined;
    }

    return new GlsLine(CommandNames.DictionaryType, "string", valueType);
};

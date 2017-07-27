import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, Node, TypeLiteralNode } from "typescript";

import { GlsLine } from "../glsLine";
import { IRecurseOntoNode } from "./aliasers/recursiveAliaser";
import { RootAliaser } from "./aliasers/rootAliaser";

const getParameterValueType = (typeMember: IndexSignatureDeclaration, recurseOntoNode: IRecurseOntoNode) => {
    if (typeMember.type === undefined) {
        return undefined;
    }

    return recurseOntoNode(typeMember.type);
};

export const getDictionaryTypeNameFromNode = (node: TypeLiteralNode, recurseOntoNode: IRecurseOntoNode) => {
    const typeMember = node.members[0];
    if (!isIndexSignatureDeclaration(typeMember)) {
        return "object";
    }

    let valueType = getParameterValueType(typeMember, recurseOntoNode);
    if (valueType === undefined) {
        valueType = "object";
    }

    return new GlsLine(CommandNames.DictionaryType, "string", valueType);
};

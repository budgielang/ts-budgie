import { CommandNames } from "general-language-syntax";
import {
    isIndexSignatureDeclaration, isTypeLiteralNode, isVariableDeclaration, Node, SyntaxKind, TypeChecker, TypeLiteralNode
} from "typescript";

import { GlsLine } from "../glsLine";
import { getTypeAlias } from "./aliases";

export const getTypeLiteralNodeName = (node: TypeLiteralNode, typeChecker: TypeChecker) => {
    const { members } = node;
    if (members.length !== 1) {
        return undefined;
    }

    const firstMember = members[0];
    if (!isIndexSignatureDeclaration(firstMember) || firstMember.type === undefined) {
        return undefined;
    }

    const parameters = firstMember.parameters;
    if (parameters.length !== 1) {
        return undefined;
    }

    const parameterType = parameters[0].type;
    if (parameterType === undefined || parameterType.kind !== SyntaxKind.StringKeyword) {
        return undefined;
    }

    const parameterTypeName = getNodeTypeName(firstMember.type, typeChecker);
    if (parameterTypeName !== undefined) {
        return new GlsLine(CommandNames.DictionaryType, "string", parameterTypeName).toString();
    }

    return undefined;
};

export const getNodeTypeName = (node: Node, typeChecker: TypeChecker): string | undefined => {
    const { intrinsicName } = typeChecker.getTypeAtLocation(node) as any;
    if (intrinsicName !== undefined) {
        return getTypeAlias(intrinsicName);
    }

    if (!isVariableDeclaration(node) || node.type === undefined || !isTypeLiteralNode(node.type)) {
        return undefined;
    }

    const typeName = getTypeLiteralNodeName(node.type, typeChecker);
    if (typeName === undefined) {
        return undefined;
    }

    return getTypeAlias(typeName);
};

export const getNumericTypeName = (usages: (number | string)[]): "int" | "float" => {
    for (const usage of usages) {
        if (typeof usage === "number") {
            if (usage % 1 !== 0) {
                return "float";
            }
        } else if (usage.indexOf(".") !== -1) {
            return "float";
        }
    }

    return "int";
};

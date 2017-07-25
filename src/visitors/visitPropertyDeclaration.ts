import { CommandNames } from "general-language-syntax";
import * as utils from "tsutils";
import { ClassDeclaration, PropertyDeclaration, SourceFile, SyntaxKind } from "typescript";

import { visitChildren } from "./visitNode";

const getPrivacy = (node: PropertyDeclaration) => {
    if (utils.hasModifier(node.modifiers, SyntaxKind.PrivateKeyword)) {
        return "private";
    }

    if (utils.hasModifier(node.modifiers, SyntaxKind.ProtectedKeyword)) {
        return "protected";
    }

    return "public";
};

export const visitPropertyDeclaration = (node: PropertyDeclaration, sourceFile: SourceFile) => {
    const privacy = getPrivacy(node);
    const instanceName = node.name.getText(sourceFile);
    const value = node.initializer;

    const results = [privacy, instanceName];
    if (value !== undefined) {
        results.push(value.getText(sourceFile));
    }

    return [
        `${CommandNames.MemberVariable} : ${results.join(" ")}`
    ];
};

import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { PropertyDeclaration, SourceFile, SyntaxKind } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";

const getPrivacy = (node: PropertyDeclaration) => {
    if (hasModifier(node.modifiers, SyntaxKind.PrivateKeyword)) {
        return "private";
    }

    if (hasModifier(node.modifiers, SyntaxKind.ProtectedKeyword)) {
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
        Transformation.fromNode(
            node,
            sourceFile,
            [
                new GlsLine(CommandNames.MemberVariable, ...results)
            ])
    ];
};

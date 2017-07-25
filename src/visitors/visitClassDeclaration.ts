import { CommandNames } from "general-language-syntax";
import { ClassDeclaration, SourceFile } from "typescript";

import { visitChildren } from "./visitNode";

export const visitClassDeclaration = (node: ClassDeclaration, sourceFile: SourceFile) => {
    if (node.name === undefined) {
        return [];
    }

    return [
        `${CommandNames.ClassStart} : ${node.name.text}`,
        ...visitChildren(node.members, sourceFile),
        `${CommandNames.ClassEnd} end`
    ];
};

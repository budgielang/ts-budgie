import { CommandNames } from "general-language-syntax";
import { ClassDeclaration, SourceFile, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";

export const visitClassDeclaration = (node: ClassDeclaration, sourceFile: SourceFile, typeChecker: TypeChecker) => {
    if (node.name === undefined) {
        return undefined;
    }

    return [
        Transformation.fromNode(
            node,
            sourceFile,
            [
                new GlsLine(CommandNames.ClassStart, node.name.text),
                ...visitNodes(node.members, sourceFile, typeChecker),
                new GlsLine(CommandNames.ClassEnd)
            ])
    ];
};

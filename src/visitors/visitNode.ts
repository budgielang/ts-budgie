import { Node, SourceFile, SyntaxKind } from "typescript";

import { visitors } from "./index";

export const visitNode = (node: Node, sourceFile: SourceFile) => {
    const visitor = visitors[node.kind] === undefined
        ? visitors[node.kind]
        : visitors[SyntaxKind.Unknown];

    return visitor(node, sourceFile);
};

export const visitNodeChildren = (node: Node, sourceFile: SourceFile) =>
    visitChildren(node.getChildren(), sourceFile);

export const visitChildren = (children: Node[], sourceFile: SourceFile) => {
    const results = [];

    for (const child of children) {
        results.push(...visitNode(child, sourceFile));
    }

    return results;
};

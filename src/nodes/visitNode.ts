import * as utils from "tsutils";
import { Node, SourceFile, SyntaxKind } from "typescript";
import * as ts from "typescript";

import { Transformation } from "../transformation";
import { INodeVisitor, nodeVisitors } from "./visitor";

export const visitNode = (node: Node, sourceFile: SourceFile) => {
    const visitor: INodeVisitor = nodeVisitors[node.kind] === undefined
        ? visitNodeChildren
        : nodeVisitors[node.kind];

    return visitor(node, sourceFile);
};

export const visitNodes = (nodes: Node[], sourceFile: SourceFile) => {
    const transformations: Transformation[] = [];

    for (const child of nodes) {
        const childTransformations = visitNode(child, sourceFile);

        if (childTransformations !== undefined) {
            transformations.push(...childTransformations);
        }
    }

    return transformations;
};

export const visitNodeChildren = (node: Node, sourceFile: SourceFile) =>
    visitNodes(node.getChildren(), sourceFile);

export const visitSourceFile = (sourceFile: SourceFile) =>
    visitNodeChildren(sourceFile, sourceFile);

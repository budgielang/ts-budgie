import { Node, SourceFile, SyntaxKind } from "typescript";
import * as ts from "typescript";
import { TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { NodeVisitor } from "./visitor";
import { nodeVisitors } from "./visitors";

export const visitNode = (node: Node, sourceFile: SourceFile, typeChecker: TypeChecker) => {
    if (nodeVisitors[node.kind] !== undefined) {
        return nodeVisitors[node.kind].visit(node, sourceFile, typeChecker);
    }

    return visitNodeChildren(node, sourceFile, typeChecker);
};

export const visitNodes = (nodes: Node[], sourceFile: SourceFile, typeChecker: TypeChecker) => {
    const transformations: Transformation[] = [];

    for (const child of nodes) {
        const childTransformations = visitNode(child, sourceFile, typeChecker);

        if (childTransformations !== undefined) {
            transformations.push(...childTransformations);
        }
    }

    return transformations;
};

export const visitNodeChildren = (node: Node, sourceFile: SourceFile, typeChecker: TypeChecker) =>
    visitNodes(node.getChildren(), sourceFile, typeChecker);

export const visitSourceFile = (sourceFile: SourceFile, typeChecker: TypeChecker) =>
    visitNodeChildren(sourceFile, sourceFile, typeChecker);

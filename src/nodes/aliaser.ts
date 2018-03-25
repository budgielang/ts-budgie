import { ArrowFunction, FunctionDeclaration, MethodDeclaration, MethodSignature, Node } from "typescript";

import { GlsLine } from "../output/glsLine";

/**
 * Literals that may refer to a node's privacy.
 */
export type IPrivacyName = "private" | "protected" | "public";

/**
 * A node type that contains a return type.
 */
export type IReturningNode = ArrowFunction | MethodDeclaration | MethodSignature | FunctionDeclaration;

/**
 * Generates GLS-friendly names for node types.
 */
export interface INodeAliaser {
    /**
     * Generates a GLS-friendly name for a node's type.
     *
     * @param node   Node to generate a type name of.
     * @returns GLS-equivalent output type name of the node, if possible.
     */
    getFriendlyTypeName(node: Node): string | GlsLine | undefined;
}

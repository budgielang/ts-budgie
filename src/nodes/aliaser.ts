import { ArrowFunction, FunctionDeclaration, MethodDeclaration, MethodSignature, Node } from "typescript";

import { GlsLine } from "../glsLine";

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

/**
 * Generates GLS-friendly names for nodes.
 */
export interface IRootAliaser extends INodeAliaser {
    /**
     * Generates a GLS-friendly name for a node's privacy.
     *
     * @param node   Node to generate a name of.
     * @returns GLS-equivalent output name of the node's privacy.
     */
    getFriendlyPrivacyName(node: Node): IPrivacyName;

    /**
     * Generates a GLS-friendly name for a node's return type.
     *
     * @param node   Node to generate a name of.
     * @returns GLS-equivalent output name of the node's return type.
     */
    getFriendlyReturnTypeName(node: IReturningNode): string | GlsLine | undefined;
}

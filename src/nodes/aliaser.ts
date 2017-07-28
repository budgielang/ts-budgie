import { Node } from "typescript";

import { GlsLine } from "../glsLine";

/**
 * Generates GLS-friendly names for nodes.
 */
export interface INodeAliaser {
    /**
     * Generates a GLS-friendly name for a node.
     *
     * @param node   Node to generate a name of.
     * @returns GLS-equivalent output name of the node, if possible.
     */
    getFriendlyTypeNameForNode(node: Node): string | GlsLine | undefined;
}

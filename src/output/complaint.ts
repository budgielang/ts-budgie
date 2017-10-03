import { Node, SourceFile } from "typescript";

import { IRange } from "./range";

/**
 * Explains why a range of source cannot be supported.
 */
export class UnsupportedComplaint {
    /**
     * Area in the source file to transform.
     */
    public readonly range: IRange;

    /**
     * Description of what's not supported.
     */
    public readonly reason: string;

    /**
     * Initializes a new instance of the Transformation class.
     *
     * @param range   Area in the source file to transform.
     * @param reason   Description of what's not supported.
     */
    private constructor(range: IRange, reason: string) {
        this.range = range;
        this.reason = reason;
    }

    /**
     * Initializes a new UnsupportedComplaint for a standard node.
     *
     * @param node   Node from the source file.
     * @param sourceFile   Source file for the node.
     * @param reason   Description of what's not supported.
     * @returns A new UnsupportedComplaint for the node.
     */
    public static forNode(node: Node, sourceFile: SourceFile, reason: string): UnsupportedComplaint {
        return new UnsupportedComplaint(
            {
                end: node.getEnd(),
                start: node.getStart(sourceFile)
            },
            reason);
    }

    /**
     * Initializes a new UnsupportedComplaint for a node with an unsupported type.
     *
     * @param node   Node from the source file.
     * @param sourceFile   Source file for the node.
     * @param reason   Description of what's not supported.
     * @returns A new UnsupportedComplaint for the node.
     */
    public static forUnsupportedTypeNode(node: Node, sourceFile: SourceFile): UnsupportedComplaint {
        return UnsupportedComplaint.forNode(node, sourceFile, "Could not parse unsupported type.");
    }
}

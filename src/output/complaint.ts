import * as ts from "typescript";

import { IRange } from "./range";

/**
 * Complaint text for an unsupported type.
 */
const unsupportedTypeComplaint = "Could not parse unsupported type.";

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
    public readonly reason: string | UnsupportedComplaint[];

    /**
     * Source file of the complaint.
     */
    private readonly sourceFile: ts.SourceFile;

    /**
     * Initializes a new instance of the Transformation class.
     *
     * @param range   Area in the source file to transform.
     * @param reason   Description of what's not supported.
     * @param sourceFile   Source file of the complaint.
     */
    private constructor(range: IRange, reason: string | UnsupportedComplaint[], sourceFile: ts.SourceFile) {
        this.range = range;
        this.reason = reason;
        this.sourceFile = sourceFile;
    }

    /**
     * Initializes a new UnsupportedComplaint for a standard node.
     *
     * @param node   Node from the source file.
     * @param sourceFile   Source file for the node.
     * @param reason   Description of what's not supported.
     * @returns A new UnsupportedComplaint for the node.
     */
    public static forNode(node: ts.Node, sourceFile: ts.SourceFile, reason: string | UnsupportedComplaint[]): UnsupportedComplaint {
        return new UnsupportedComplaint(
            {
                end: node.getEnd(),
                start: node.getStart(sourceFile)
            },
            reason,
            sourceFile);
    }

    /**
     * Initializes a new UnsupportedComplaint for a node with an unsupported type.
     *
     * @param node   Node from the source file.
     * @param sourceFile   Source file for the node.
     * @param reason   Description of what's not supported.
     * @returns A new UnsupportedComplaint for the node.
     */
    public static forUnsupportedTypeNode(node: ts.Node, sourceFile: ts.SourceFile): UnsupportedComplaint {
        return UnsupportedComplaint.forNode(node, sourceFile, unsupportedTypeComplaint);
    }

    /**
     * @returns A friendly representation of this complaint.
     */
    public toString(): string {
        const position = this.sourceFile.getLineAndCharacterOfPosition(this.range.start);
        const reason = typeof this.reason === "string"
            ? [`Line ${position.line + 1}, column ${position.character + 1}: ${this.reason}`]
            : this.reason;

        return reason.join("\n");
    }
}

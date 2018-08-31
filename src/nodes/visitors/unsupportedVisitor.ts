import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { NodeVisitor } from "../visitor";

/**
 * Creates node visitors for unsupported node types.
 */
export abstract class UnsupportedVisitor {
    public static withDescriptor(description: string): typeof NodeVisitor {
        // tslint:disable-next-line:max-classes-per-file
        return class extends NodeVisitor {
            public visit(node: ts.Node): UnsupportedComplaint {
                return UnsupportedComplaint.forNode(
                    node,
                    this.sourceFile,
                    `GLS does not support ${description}.`);
            }
        };
    }
}

import * as ts from "typescript";

import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

/**
 * Creates node visitors for unsupported node types.
 */
export abstract class UnsupportedVisitor {
    public static withDescriptor(description: string): typeof NodeVisitor {
        // tslint:disable-next-line:max-classes-per-file
        return class extends NodeVisitor {
            public visit(node: ts.Node): Transformation[] {
                return [
                    Transformation.fromNode(
                        node,
                        this.sourceFile,
                        [
                            createUnsupportedGlsLine(`GLS does not support ${description}.`),
                        ])
                ];
            }
        };
    }
}

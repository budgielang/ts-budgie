import * as ts from "typescript";

import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { getDictionaryTypeNameFromNode } from "../../parsing/dictionaries";
import { NodeVisitor } from "../visitor";

export class TypeLiteralVisitor extends NodeVisitor {
    public visit(node: ts.TypeLiteralNode) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    this.getTransformationContents(node),
                ])
        ];
    }

    private getTransformationContents(node: ts.TypeLiteralNode) {
        const dictionaryTypeName = getDictionaryTypeNameFromNode(node, this.aliaser.getFriendlyTypeName);

        return dictionaryTypeName === undefined
            ? createUnsupportedTypeGlsLine()
            : dictionaryTypeName;
    }
}

import { TypeLiteralNode } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { Transformation } from "../../output/transformation";
import { getDictionaryTypeNameFromNode } from "../../parsing/dictionaries";
import { NodeVisitor } from "../visitor";

export class TypeLiteralVisitor extends NodeVisitor {
    public visit(node: TypeLiteralNode) {
        const dictionaryTypeName = getDictionaryTypeNameFromNode(node, this.aliaser.getFriendlyTypeName);
        if (dictionaryTypeName === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    dictionaryTypeName
                ])
        ];
    }
}

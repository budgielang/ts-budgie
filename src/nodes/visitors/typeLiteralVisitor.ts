import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, TypeLiteralNode } from "typescript";

import { getDictionaryTypeNameFromNode } from "../../parsing/dictionaries";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class TypeLiteralVisitor extends NodeVisitor {
    public visit(node: TypeLiteralNode) {
        const dictionaryTypeName = getDictionaryTypeNameFromNode(node, this.aliaser.getFriendlyTypeNameForNode);
        if (dictionaryTypeName === undefined || dictionaryTypeName === "object") {
            return undefined;
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

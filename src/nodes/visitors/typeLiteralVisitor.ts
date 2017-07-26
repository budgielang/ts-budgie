import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, TypeLiteralNode } from "typescript";

import { GlsLine } from "../../glsLine";
import { getNodeTypeName } from "../../parsing/names";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class TypeLiteralVisitor extends NodeVisitor {
    public visit(node: TypeLiteralNode) {
        if (node.members.length !== 1) {
            return undefined;
        }

        const typeMember = node.members[0];
        if (!isIndexSignatureDeclaration(typeMember)) {
            return undefined;
        }

        const valueType = this.getParameterValueType(typeMember);
        if (valueType === undefined) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.DictionaryType, "string", valueType)
                ])
        ];
    }

    private getParameterValueType(typeMember: IndexSignatureDeclaration) {
        if (typeMember.type === undefined) {
            return undefined;
        }

        return getNodeTypeName(typeMember.type, this.typeChecker);
    }
}

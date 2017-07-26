import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import {
    Identifier, IndexSignatureDeclaration, isIndexSignatureDeclaration, SourceFile, SyntaxKind, TypeChecker, TypeLiteralNode
} from "typescript";

import { GlsLine } from "../../glsLine";
import { operators } from "../../parsing/aliases";
import { getNodeTypeName } from "../../parsing/names";
import { Transformation } from "../../transformation";
import { visitNodes } from "../visitNode";
import { NodeVisitor } from "../visitor";

const getParameterValueType = (typeMember: IndexSignatureDeclaration, typeChecker: TypeChecker) => {
    if (typeMember.type === undefined) {
        return undefined;
    }

    return getNodeTypeName(typeMember.type, typeChecker);
};

export class TypeLiteralVisitor extends NodeVisitor {
    public visit(node: TypeLiteralNode, sourceFile: SourceFile, typeChecker: TypeChecker) {
        if (node.members.length !== 1) {
            return undefined;
        }

        const typeMember = node.members[0];
        if (!isIndexSignatureDeclaration(typeMember)) {
            return undefined;
        }

        const valueType = getParameterValueType(typeMember, typeChecker);
        if (valueType === undefined) {
            return undefined;
        }

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.DictionaryType, "string", valueType)
                ])
        ];
    }
}

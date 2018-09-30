import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class ObjectLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ObjectLiteralExpression): Transformation[] {
        if (node.parent === undefined) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedTypeGlsLine()])];
        }

        const parentTypePair = this.getParentTypePair(node.parent);
        if (parentTypePair instanceof GlsLine) {
            return [Transformation.fromNode(node, this.sourceFile, [parentTypePair])];
        }

        const [typeKeys, typeValues] = parentTypePair;

        return node.properties.length === 0
            ? this.returnForBlankDictionary(node, typeKeys, typeValues)
            : this.returnForPopulatingDictionary(node, typeKeys, typeValues);
    }

    private getParentTypePair(node: ts.Node) {
        if (ts.isBinaryExpression(node)) {
            return this.getDirectNodeTypePair(node.left);
        }

        if (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) {
            return this.getDirectNodeTypePair(node);
        }

        return createUnsupportedTypeGlsLine();
    }

    private getDirectNodeTypePair(node: ts.Expression | ts.PropertyDeclaration | ts.VariableDeclaration) {
        const typeName = this.aliaser.getFriendlyTypeName(node);
        if (!(typeName instanceof GlsLine) || typeName.command !== CommandNames.DictionaryType) {
            return createUnsupportedTypeGlsLine();
        }

        return typeName.args;
    }

    private returnForBlankDictionary(node: ts.Node, typeKeys: string | GlsLine, typeValues: string | GlsLine) {
        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.DictionaryNew, typeKeys, typeValues)])];
    }

    private returnForPopulatingDictionary(node: ts.ObjectLiteralExpression, typeKeys: string | GlsLine, typeValues: string | GlsLine) {
        const typeLine = new GlsLine(CommandNames.DictionaryType, typeKeys, typeValues);

        this.context.setTypeCoercion(typeLine);
        const bodyNodes = node.properties.map((bodyNode) =>
            Transformation.fromNode(bodyNode, this.sourceFile, this.router.recurseIntoNode(bodyNode)),
        );
        this.context.exitTypeCoercion();

        return [
            Transformation.fromNodeStart(node, this.sourceFile, [new GlsLine(CommandNames.DictionaryNewStart, typeKeys, typeValues)]),
            ...bodyNodes,
            Transformation.fromNodeEnd(node, [new GlsLine(CommandNames.DictionaryNewEnd)]),
        ];
    }
}

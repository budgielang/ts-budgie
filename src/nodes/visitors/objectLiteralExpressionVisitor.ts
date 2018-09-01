import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class ObjectLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ObjectLiteralExpression) {
        return [Transformation.fromNode(node, this.sourceFile, this.getTransformationContents(node))];
    }

    private getTransformationContents(node: ts.ObjectLiteralExpression): (GlsLine | Transformation)[] {
        if (node.parent === undefined) {
            return [createUnsupportedTypeGlsLine()];
        }

        const parentTypePair = this.getParentTypePair(node.parent);
        if (parentTypePair instanceof GlsLine) {
            return [parentTypePair];
        }

        const [typeKeys, typeValues] = parentTypePair;

        return node.properties.length === 0
            ? this.returnForBlankDictionary(typeKeys, typeValues)
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

    private returnForBlankDictionary(typeKeys: string | GlsLine, typeValues: string | GlsLine): GlsLine[] {
        return [new GlsLine(CommandNames.DictionaryNew, typeKeys, typeValues)];
    }

    private returnForPopulatingDictionary(
        node: ts.ObjectLiteralExpression,
        typeKeys: string | GlsLine,
        typeValues: string | GlsLine,
    ): (GlsLine | Transformation)[] {
        const typeLine = new GlsLine(CommandNames.DictionaryType, typeKeys, typeValues);

        this.context.setTypeCoercion(typeLine);
        const bodyNodes = this.router.recurseIntoNodes(node.properties);
        this.context.exitTypeCoercion();

        return [
            new GlsLine(CommandNames.DictionaryNewStart, typeKeys, typeValues),
            ...bodyNodes,
            new GlsLine(CommandNames.DictionaryNewEnd),
        ];
    }
}

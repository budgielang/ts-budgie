import { CommandNames, KeywordNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { filterOutUnsupportedComplaint } from "../../utils";
import { NodeVisitor } from "../visitor";

export class ObjectLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ObjectLiteralExpression) {
        if (node.parent === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        const parentTypePair = this.getParentTypePair(node.parent);
        if (parentTypePair instanceof UnsupportedComplaint) {
            return parentTypePair;
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

        if (ts.isVariableDeclaration(node)) {
            return this.getDirectNodeTypePair(node);
        }

        return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
    }

    private getDirectNodeTypePair(node: ts.Expression | ts.VariableDeclaration) {
        const typeName = this.aliaser.getFriendlyTypeName(node);
        if (!(typeName instanceof GlsLine) || typeName.command !== CommandNames.DictionaryType) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        return typeName.args;
    }

    private returnForBlankDictionary(
        node: ts.ObjectLiteralExpression, typeKeys: string | GlsLine, typeValues: string | GlsLine) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.DictionaryNew, typeKeys, typeValues)
                ])
        ];
    }

    private returnForPopulatingDictionary(
        node: ts.ObjectLiteralExpression, typeKeys: string | GlsLine, typeValues: string | GlsLine) {
        const typeLine = new GlsLine(CommandNames.DictionaryType, typeKeys, typeValues);

        this.context.setTypeCoercion(typeLine);
        const bodyNodes = this.router.recurseIntoNodes(node.properties, node);
        this.context.exitTypeCoercion();

        if (bodyNodes instanceof UnsupportedComplaint) {
            return bodyNodes;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.DictionaryNewStart, typeKeys, typeValues),
                    ...bodyNodes,
                    new GlsLine(CommandNames.DictionaryNewEnd)
                ])
        ];
    }
}

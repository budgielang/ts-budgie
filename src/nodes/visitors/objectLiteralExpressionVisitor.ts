import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class ObjectLiteralExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ObjectLiteralExpression): Transformation[] {
        if (node.parent === undefined) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedTypeBudgieLine()])];
        }

        const parentTypePair = this.getParentTypePair(node.parent);
        if (parentTypePair instanceof BudgieLine) {
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

        return createUnsupportedTypeBudgieLine();
    }

    private getDirectNodeTypePair(node: ts.Expression | ts.PropertyDeclaration | ts.VariableDeclaration) {
        const typeName = this.aliaser.getFriendlyTypeName(node);
        if (!(typeName instanceof BudgieLine) || typeName.command !== CommandNames.DictionaryType) {
            return createUnsupportedTypeBudgieLine();
        }

        return typeName.args;
    }

    private returnForBlankDictionary(node: ts.Node, typeKeys: string | BudgieLine, typeValues: string | BudgieLine) {
        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(CommandNames.DictionaryNew, typeKeys, typeValues)])];
    }

    private returnForPopulatingDictionary(
        node: ts.ObjectLiteralExpression,
        typeKeys: string | BudgieLine,
        typeValues: string | BudgieLine,
    ) {
        const typeLine = new BudgieLine(CommandNames.DictionaryType, typeKeys, typeValues);

        this.context.setTypeCoercion(typeLine);
        const bodyNodes = node.properties.map((bodyNode) =>
            Transformation.fromNode(bodyNode, this.sourceFile, this.router.recurseIntoNode(bodyNode)),
        );
        this.context.exitTypeCoercion();

        return [
            Transformation.fromNodeStart(node, this.sourceFile, [new BudgieLine(CommandNames.DictionaryNewStart, typeKeys, typeValues)]),
            ...bodyNodes,
            Transformation.fromNodeEnd(node, [new BudgieLine(CommandNames.DictionaryNewEnd)]),
        ];
    }
}

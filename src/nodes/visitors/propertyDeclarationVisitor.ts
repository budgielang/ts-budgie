import { CommandNames } from "budgie";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

export class PropertyDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.PropertyDeclaration) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getTransformationContents(node)])];
    }

    private getTransformationContents(node: ts.PropertyDeclaration) {
        const type = this.getType(node);
        if (type === undefined) {
            return createUnsupportedTypeBudgieLine();
        }

        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const name = node.name.getText(this.sourceFile);
        const results: (string | BudgieLine)[] = [privacy, name, type];

        const value = this.getInitializerValue(node.initializer);
        if (value !== undefined) {
            results.push(value);
        }

        return new BudgieLine(this.getBudgieCommand(node), ...results);
    }

    private getInitializerValue(initializer: ts.Expression | undefined) {
        if (initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoValue(initializer);
    }

    private getType(node: ts.PropertyDeclaration) {
        if (node.type !== undefined) {
            return this.aliaser.getFriendlyTypeName(node.type);
        }

        if (node.initializer !== undefined) {
            return this.aliaser.getFriendlyTypeName(node.initializer);
        }

        return undefined;
    }

    private getBudgieCommand(node: ts.PropertyDeclaration) {
        if (tsutils.hasModifier(node.modifiers, ts.SyntaxKind.StaticKeyword)) {
            return CommandNames.StaticVariableDeclare;
        }

        return CommandNames.MemberVariableDeclare;
    }
}

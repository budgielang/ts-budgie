import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { Expression, PropertyDeclaration, SyntaxKind } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class PropertyDeclarationVisitor extends NodeVisitor {
    public visit(node: PropertyDeclaration) {
        const type = this.getType(node);
        if (type === undefined) {
            return undefined;
        }

        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const name = node.name.getText(this.sourceFile);
        const results: (string | GlsLine)[] = [privacy, name, type];

        const value = this.getInitializerValue(node.initializer);
        if (value !== undefined) {
            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.MemberVariableDeclare, ...results)
                ])
        ];
    }

    private getInitializerValue(initializer: Expression | undefined) {
        if (initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoValue(initializer);
    }

    private getType(node: PropertyDeclaration) {
        if (node.type !== undefined) {
            return this.aliaser.getFriendlyTypeName(node.type);
        }

        if (node.initializer !== undefined) {
            return this.aliaser.getFriendlyTypeName(node.initializer);
        }

        return undefined;
    }
}

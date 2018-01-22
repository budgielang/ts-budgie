import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { Expression, PropertyDeclaration, SyntaxKind } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

export class PropertyDeclarationVisitor extends NodeVisitor {
    public visit(node: PropertyDeclaration) {
        const type = this.getType(node);

        if (type === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        if (type instanceof UnsupportedComplaint) {
            return type;
        }

        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const name = node.name.getText(this.sourceFile);
        const results: (string | GlsLine)[] = [privacy, name, type];

        const value = this.getInitializerValue(node.initializer);
        if (value !== undefined) {
            if (value instanceof UnsupportedComplaint) {
                return value;
            }

            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(this.getGlsCommand(node), ...results)
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

        return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
    }

    private getGlsCommand(node: PropertyDeclaration) {
        if (hasModifier(node.modifiers, SyntaxKind.StaticKeyword)) {
            return CommandNames.StaticVariableDeclare;
        }

        return CommandNames.MemberVariableDeclare;
    }
}

import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { Expression, PropertyDeclaration, SyntaxKind } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class PropertyDeclarationVisitor extends NodeVisitor {
    public visit(node: PropertyDeclaration) {
        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const instanceName = node.name.getText(this.sourceFile);
        const value = this.getInitializerValue(node.initializer);

        const results: (string | GlsLine)[] = [privacy, instanceName];
        if (value !== undefined) {
            results.push(value);
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.MemberVariable, ...results)
                ])
        ];
    }

    private getInitializerValue(initializer: Expression | undefined) {
        if (initializer === undefined) {
            return undefined;
        }

        return this.router.recurseIntoValue(initializer);
    }
}

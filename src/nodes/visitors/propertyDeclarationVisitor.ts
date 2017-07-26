import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { Expression, PropertyDeclaration, SyntaxKind } from "typescript";

import { GlsLine } from "../../glsLine";
import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

const getPrivacy = (node: PropertyDeclaration) => {
    if (hasModifier(node.modifiers, SyntaxKind.PrivateKeyword)) {
        return "private";
    }

    if (hasModifier(node.modifiers, SyntaxKind.ProtectedKeyword)) {
        return "protected";
    }

    return "public";
};

export class PropertyDeclarationVisitor extends NodeVisitor {
    public visit(node: PropertyDeclaration) {
        const privacy = getPrivacy(node);
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

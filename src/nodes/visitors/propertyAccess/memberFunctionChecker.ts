import { CaseStyle, CommandNames } from "general-language-syntax";

import { CallExpression, Expression, Identifier, isCallExpression, PropertyAccessExpression } from "typescript/lib/typescript";
import { GlsLine } from "../../../glsLine";
import { Transformation } from "../../../transformation";
import { NodeVisitor } from "../../visitor";

export class MemberFunctionChecker extends NodeVisitor {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined || !isCallExpression(node.parent)) {
            return undefined;
        }

        const args = node.parent.arguments.map((arg) => this.router.recurseIntoValue(arg));
        const caller = this.router.recurseIntoValue(node.expression);
        const functionName = this.casing.getConverter(CaseStyle.PascalCase).convert([node.name.getText(this.sourceFile)]);
        const privacy = this.getFunctionPrivacy(node.expression, node.name);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.MemberFunction, privacy, caller, functionName, ...args)
                ])
        ];
    }

    private getFunctionPrivacy(expression: Expression, name: Identifier) {
        const classSymbol = this.typeChecker.getSymbolAtLocation(expression);
        if (classSymbol === undefined || classSymbol.members === undefined) {
            return "public";
        }

        const nameSymbol = this.typeChecker.getSymbolAtLocation(name);
        if (nameSymbol === undefined) {
            return "public";
        }

        const functionSymbol = classSymbol.members.get(nameSymbol.escapedName);
        if (functionSymbol === undefined || functionSymbol.declarations === undefined) {
            return "public";
        }

        return this.aliaser.getFriendlyPrivacyName(functionSymbol.declarations[0]);
    }
}

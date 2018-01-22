import { CommandNames } from "general-language-syntax";
import { Expression, Identifier, isCallExpression, PropertyAccessExpression } from "typescript";

import { UnsupportedComplaint } from "../../../output/complaint";
import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";
import { PropertyAccessChecker } from "./propertyAccessChecker";

export class MemberVariableChecker extends PropertyAccessChecker {
    public visit(node: PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined || isCallExpression(node.parent)) {
            return undefined;
        }

        const caller = this.router.recurseIntoValue(node.expression);
        if (caller instanceof UnsupportedComplaint) {
            return undefined;
        }

        const variableName = node.name.getText(this.sourceFile);
        const privacy = this.getMemberPrivacy(node.expression, node.name);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.MemberVariable, privacy, caller, variableName)
                ])
        ];
    }

    private getMemberPrivacy(expression: Expression, name: Identifier) {
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

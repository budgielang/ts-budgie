import { CommandNames, KeywordNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";

import { PropertyAccessChecker } from "./propertyAccessChecker";

export class MemberVariableChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined || ts.isCallExpression(node)) {
            return undefined;
        }

        const caller = this.router.recurseIntoValue(node.expression);
        const variableName = node.name.getText(this.sourceFile);
        const privacy = this.getMemberPrivacy(node.expression, node.name);

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(CommandNames.MemberVariable, privacy, caller, variableName)])];
    }

    private getMemberPrivacy(expression: ts.Expression, name: ts.Identifier) {
        const classSymbol = this.typeChecker.getSymbolAtLocation(expression);
        if (classSymbol === undefined || classSymbol.members === undefined) {
            return KeywordNames.Public;
        }

        const nameSymbol = this.typeChecker.getSymbolAtLocation(name);
        if (nameSymbol === undefined) {
            return KeywordNames.Public;
        }

        const functionSymbol = classSymbol.members.get(nameSymbol.escapedName);
        if (functionSymbol === undefined || functionSymbol.declarations === undefined) {
            return KeywordNames.Public;
        }

        return this.aliaser.getFriendlyPrivacyName(functionSymbol.declarations[0]);
    }
}

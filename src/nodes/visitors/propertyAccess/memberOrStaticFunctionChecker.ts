import { CaseStyle, CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { hasModifier } from "tsutils";
import { UnsupportedComplaint } from "../../../output/complaint";
import { GlsLine } from "../../../output/glsLine";
import { Transformation } from "../../../output/transformation";
import { filterOutUnsupportedComplaint } from "../../../utils";
import { PropertyAccessChecker } from "./propertyAccessChecker";

export class MemberOrStaticFunctionChecker extends PropertyAccessChecker {
    public visit(node: ts.PropertyAccessExpression): Transformation[] | undefined {
        if (node.parent === undefined || !ts.isCallExpression(node.parent)) {
            return undefined;
        }

        const hostContainerAndSignature = this.getHostContainerAndSignature(node);
        if (hostContainerAndSignature === undefined) {
            return undefined;
        }

        const { commandName, hostSignature, trueClassSymbol } = hostContainerAndSignature;
        if (hostSignature.declarations === undefined) {
            return undefined;
        }

        const caller = this.router.recurseIntoValue(node.expression);
        if (caller instanceof UnsupportedComplaint) {
            return undefined;
        }

        const args = filterOutUnsupportedComplaint(
            node.parent.arguments.map(
                (arg) => this.router.recurseIntoValue(arg)));
        if (args instanceof UnsupportedComplaint) {
            return undefined;
        }

        const [hostDeclaration] = hostSignature.declarations;

        const privacy = this.aliaser.getFriendlyPrivacyName(hostDeclaration);
        const functionNameSplit = this.nameSplitter.split(node.name.getText(this.sourceFile));
        const functionName = this.casing.convertToCase(CaseStyle.PascalCase, functionNameSplit);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(commandName, privacy, caller, functionName, ...args)
                ])
        ];
    }

    private getHostContainerAndSignature(node: ts.PropertyAccessExpression) {
        const direct = this.getHostContainerAndSignatureOfPropertyAccess(node.expression, node.name);
        if (direct !== undefined) {
            return direct;
        }

        if (ts.isIdentifier(node.expression)) {
            return this.getHostContainerAndSignatureOfPropertyAccess(node.expression, node.name);
        }

        if (ts.isPropertyAccessExpression(node.expression)) {
            return this.getHostContainerAndSignatureOfPropertyAccess(
                node.expression.expression,
                node.expression.name);
        }

        if (ts.isCallExpression(node.expression) && ts.isPropertyAccessExpression(node.expression.expression)) {
            return this.getHostContainerAndSignatureOfPropertyAccess(
                node.expression.expression.expression,
                node.expression.expression.name);
        }

        return undefined;
    }

    private getHostContainerAndSignatureOfPropertyAccess(expression: ts.Identifier | ts.LeftHandSideExpression, name: ts.Identifier) {
        const nameSymbol = this.typeChecker.getSymbolAtLocation(name);
        if (nameSymbol === undefined) {
            return undefined;
        }

        const classSymbol = this.getClassSymbol(expression, nameSymbol);
        if (classSymbol === undefined) {
            return undefined;
        }

        const { escapedName } = nameSymbol;

        // If the class was imported from another file, this might be necessary to get the real type
        const declaredClassSymbol = this.typeChecker.getDeclaredTypeOfSymbol(classSymbol).symbol;
        const trueClassSymbol = declaredClassSymbol === undefined
            ? classSymbol
            : declaredClassSymbol;

        // Protected properties are only listed as augmented properties (not in .members)
        const expressionType = this.typeChecker.getTypeAtLocation(expression);
        const classProperties = this.typeChecker.getAugmentedPropertiesOfType(expressionType);
        for (const classProperty of classProperties) {
            if (classProperty.escapedName !== escapedName) {
                continue;
            }

            if (classProperty.valueDeclaration === undefined) {
                return undefined;
            }

            return {
                commandName: hasModifier(classProperty.valueDeclaration.modifiers, ts.SyntaxKind.StaticKeyword)
                    ? CommandNames.StaticFunction
                    : CommandNames.MemberFunction,
                hostSignature: classProperty,
                trueClassSymbol
            };
        }

        return undefined;
    }

    private getClassSymbol(expression: ts.LeftHandSideExpression, nameSymbol: ts.Symbol): ts.Symbol | undefined {
        // If the expression is a direct class usage, this will normally work
        const direct = this.typeChecker.getSymbolAtLocation(expression);
        if (direct !== undefined) {
            return direct;
        }

        // Otherwise, we'll have to try to parse through the function's declarations
        if (nameSymbol.valueDeclaration === undefined || nameSymbol.valueDeclaration.parent === undefined) {
            return undefined;
        }

        return this.typeChecker.getTypeAtLocation(nameSymbol.valueDeclaration.parent).symbol;
    }
}

import { CaseStyle, CommandNames } from "general-language-syntax";
import * as ts from "typescript";

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

        const { classSymbol, hostContainer, hostSignature } = hostContainerAndSignature;
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
        const commandName = hostContainer === classSymbol.members
            ? CommandNames.MemberFunction
            : CommandNames.StaticFunction;

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
        const classSymbol = this.typeChecker.getSymbolAtLocation(node.expression);
        if (classSymbol === undefined) {
            return undefined;
        }

        const nameSymbol = this.typeChecker.getSymbolAtLocation(node.name);
        if (nameSymbol === undefined) {
            return undefined;
        }

        const { escapedName } = nameSymbol;

        if (classSymbol.members !== undefined) {
            const memberSymbol = classSymbol.members.get(escapedName);
            if (memberSymbol !== undefined && memberSymbol.declarations !== undefined) {
                return {
                    classSymbol,
                    hostContainer: classSymbol.members,
                    hostSignature: memberSymbol
                };
            }
        }

        if (classSymbol.exports !== undefined) {
            const staticSymbol = classSymbol.exports.get(escapedName);
            if (staticSymbol !== undefined && staticSymbol.declarations !== undefined) {
                return {
                    classSymbol,
                    hostContainer: classSymbol.exports,
                    hostSignature: staticSymbol
                };
            }
        }

        return undefined;
    }
}

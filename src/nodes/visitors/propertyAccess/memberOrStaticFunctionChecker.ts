import { CaseStyle, CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../../glsLine";
import { Transformation } from "../../../transformation";
import { NodeVisitor } from "../../visitor";

export class MemberOrStaticFunctionChecker extends NodeVisitor {
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

        const [hostDeclaration] = hostSignature.declarations;
        const commandName = hostContainer === classSymbol.members
            ? CommandNames.MemberFunction
            : CommandNames.StaticFunction;

        const privacy = this.aliaser.getFriendlyPrivacyName(hostDeclaration);
        const args = node.parent.arguments.map((arg) => this.router.recurseIntoValue(arg));
        const caller = this.router.recurseIntoValue(node.expression);
        const functionName = this.casing.getConverter(CaseStyle.PascalCase).convert([node.name.getText(this.sourceFile)]);

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

import { CaseStyle, CommandNames } from "budgie";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine, createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const noAbstractStaticMethods = "Static methods may not be marked abstract.";

const noBodyComplaint = "Non-abstract methods may not have bodies.";

const unknownReturnTypeComplaint = "Could not parse method return type.";

export class MethodDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.MethodDeclaration): Transformation[] {
        const returnType = this.aliaser.getFriendlyReturnTypeName(node);
        if (returnType === undefined) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedBudgieLine(unknownReturnTypeComplaint)])];
        }

        const methodArgs = this.accumulateParameters(node.parameters);
        const privacy = this.aliaser.getFriendlyPrivacyName(node);
        const nameSplit = this.nameSplitter.split(node.name.getText(this.sourceFile));
        const name = this.casing.convertToCase(CaseStyle.PascalCase, nameSplit);
        const parameters = [privacy, name, returnType, ...methodArgs];

        return tsutils.hasModifier(node.modifiers, ts.SyntaxKind.AbstractKeyword)
            ? this.returnAbstractTransformation(node, parameters)
            : this.returnConcreteTransformation(node, parameters);
    }

    private returnAbstractTransformation(node: ts.MethodDeclaration, parameters: (string | BudgieLine)[]) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getAbstractTransformationContents(node, parameters)])];
    }

    private getAbstractTransformationContents(node: ts.MethodDeclaration, parameters: (string | BudgieLine)[]) {
        if (node.body !== undefined) {
            return createUnsupportedBudgieLine(noBodyComplaint);
        }

        if (tsutils.hasModifier(node.modifiers, ts.SyntaxKind.StaticKeyword)) {
            return createUnsupportedBudgieLine(noAbstractStaticMethods);
        }

        return new BudgieLine(CommandNames.MemberFunctionDeclareAbstract, ...parameters);
    }

    private returnConcreteTransformation(node: ts.MethodDeclaration, parameters: (string | BudgieLine)[]) {
        return [Transformation.fromNode(node, this.sourceFile, this.getConcreteTransformationContents(node, parameters))];
    }

    private getConcreteTransformationContents(node: ts.MethodDeclaration, parameters: (string | BudgieLine)[]) {
        if (node.body === undefined) {
            return [createUnsupportedBudgieLine(noBodyComplaint)];
        }

        const bodyNodes = this.router.recurseIntoNodes(node.body.statements);
        const [commandStart, commandEnd] = this.getConcreteCommandNames(node);

        return [new BudgieLine(commandStart, ...parameters), ...bodyNodes, new BudgieLine(commandEnd)];
    }

    private accumulateParameters(declarations: ReadonlyArray<ts.ParameterDeclaration>): (string | BudgieLine)[] {
        const parameters: (string | BudgieLine)[] = [];

        for (const declaration of declarations) {
            const typeName = this.aliaser.getFriendlyTypeName(declaration);
            if (typeName === undefined) {
                return [createUnsupportedTypeBudgieLine()];
            }

            parameters.push(declaration.name.getText(this.sourceFile));
            parameters.push(typeName);
        }

        return parameters;
    }

    private getConcreteCommandNames(node: ts.MethodDeclaration) {
        return tsutils.hasModifier(node.modifiers, ts.SyntaxKind.StaticKeyword)
            ? [CommandNames.StaticFunctionDeclareStart, CommandNames.StaticFunctionDeclareEnd]
            : [CommandNames.MemberFunctionDeclareStart, CommandNames.MemberFunctionDeclareEnd];
    }
}

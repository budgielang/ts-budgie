import { CaseStyle, CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine, createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const methodReturnTypeComplaint = "Could not parse method return type";

export class MethodSignatureVisitor extends NodeVisitor {
    public visit(node: ts.MethodSignature) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getTransformationContents(node)])];
    }

    private getTransformationContents(node: ts.MethodSignature): BudgieLine {
        const returnType = this.aliaser.getFriendlyReturnTypeName(node);
        if (returnType === undefined) {
            return createUnsupportedBudgieLine(methodReturnTypeComplaint);
        }

        const parameters = this.accumulateParameters(node.parameters);
        const nameSplit = this.nameSplitter.split(node.name.getText(this.sourceFile));
        const name = this.casing.convertToCase(CaseStyle.PascalCase, nameSplit);

        return new BudgieLine(CommandNames.InterfaceMethod, name, returnType, ...parameters);
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
}

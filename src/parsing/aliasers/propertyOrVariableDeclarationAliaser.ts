import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";

import { RecursiveAliaser } from "./recursiveAliaser";

export class PropertyOrVariableDeclarationAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: ts.PropertyDeclaration | ts.VariableDeclaration): string | BudgieLine | undefined {
        if (node.type !== undefined) {
            return this.recurseOntoNode(node.type);
        }

        if (node.initializer !== undefined) {
            return this.recurseOntoNode(node.initializer);
        }

        return undefined;
    }
}

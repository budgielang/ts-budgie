import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";

import { RecursiveAliaser } from "./recursiveAliaser";

export class ArrayLiteralExpressionAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: ts.ArrayLiteralExpression): string | BudgieLine | undefined {
        const elementsType = this.getCommonElementsType(node.elements);
        if (elementsType === undefined) {
            return undefined;
        }

        return new BudgieLine(CommandNames.ListType, elementsType);
    }

    private getCommonElementsType(elements: ReadonlyArray<ts.Expression>) {
        if (elements.length === 0) {
            return undefined;
        }

        return this.recurseOntoNode(elements[0]);
    }
}

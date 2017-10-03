import { CommandNames } from "general-language-syntax";
import { ArrayLiteralExpression, Expression, Node } from "typescript";

import { GlsLine } from "../../output/glsLine";
import { RecursiveAliaser } from "./recursiveAliaser";

export class ArrayLiteralExpressionAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: ArrayLiteralExpression): string | GlsLine | undefined {
        const elementsType = this.getCommonElementsType(node.elements);
        if (elementsType === undefined) {
            return undefined;
        }

        return new GlsLine(CommandNames.ListType, elementsType);
    }

    private getCommonElementsType(elements: ReadonlyArray<Expression>) {
        if (elements.length === 0) {
            return undefined;
        }

        return this.recurseOntoNode(elements[0]);
    }
}

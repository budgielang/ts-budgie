import { CommandNames } from "general-language-syntax";
import { ArrayLiteralExpression, Expression, Node } from "typescript";

import { GlsLine } from "../../glsLine";
import { RecursiveAliaser } from "./recursiveAliaser";

export class ArrayLiteralExpressionAliaser extends RecursiveAliaser {
    public getFriendlyTypeNameForNode(node: ArrayLiteralExpression): string | GlsLine | undefined {
        const elementsType = this.getCommonElementsType(node.elements);
        if (elementsType === undefined) {
            return undefined;
        }

        return new GlsLine(CommandNames.ListType, elementsType);
    }

    private getCommonElementsType(elements: Expression[]) {
        if (elements.length === 0) {
            return "object";
        }

        return this.recurseOntoNode(elements[0]);
    }
}

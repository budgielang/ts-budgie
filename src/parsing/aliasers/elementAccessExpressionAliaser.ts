import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { isNumericTypeName } from "../numerics";

import { RecursiveAliaser } from "./recursiveAliaser";

export class ElementAccessExpressionAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: ts.ElementAccessExpression): string | BudgieLine | undefined {
        const { argumentExpression } = node;
        if (argumentExpression === undefined) {
            return undefined;
        }

        const argumentType = this.recurseOntoNode(argumentExpression);
        if (typeof argumentType !== "string" || !isNumericTypeName(argumentType)) {
            return undefined;
        }

        const arrayType = this.recurseOntoNode(node.expression);
        if (!(arrayType instanceof BudgieLine)) {
            return undefined;
        }

        if (arrayType.command === CommandNames.ListType) {
            return arrayType.args[0];
        }

        return undefined;
    }
}

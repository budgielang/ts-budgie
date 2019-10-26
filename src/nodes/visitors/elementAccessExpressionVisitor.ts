import { CommandNames } from "budgie";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine, createUnsupportedTypeBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const noArgumentExpressionComplaint = "No index passed to [] access.";

const knownSimpleFriendlyTypeCommands = new Map<string, string>([["string", CommandNames.StringIndex]]);

const knownComplexFriendlyTypeCommands = new Map<string, string>([
    [CommandNames.ListType, "list index"],
    [CommandNames.DictionaryType, "dictionary index"],
]);

export class ElementAccessExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ElementAccessExpression) {
        if (node.argumentExpression === undefined) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedBudgieLine(noArgumentExpressionComplaint)])];
        }

        const commandName = this.getCommandName(node.expression);
        if (commandName instanceof BudgieLine) {
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedBudgieLine(noArgumentExpressionComplaint)])];
        }

        const expression = this.router.recurseIntoValue(node.expression);
        const argument = this.router.recurseIntoValue(node.argumentExpression);

        return [Transformation.fromNode(node, this.sourceFile, [new BudgieLine(commandName, expression, argument)])];
    }

    private getCommandName(expression: ts.Expression): string | BudgieLine {
        const friendlyType = this.aliaser.getFriendlyTypeName(expression);
        if (friendlyType === undefined) {
            return createUnsupportedTypeBudgieLine();
        }

        const [typeKey, commandsContainer] =
            typeof friendlyType === "string"
                ? [friendlyType, knownSimpleFriendlyTypeCommands]
                : [friendlyType.command, knownComplexFriendlyTypeCommands];

        const typeCommand = commandsContainer.get(typeKey);
        return typeCommand === undefined ? createUnsupportedTypeBudgieLine() : typeCommand;
    }
}

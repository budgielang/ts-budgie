import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine, createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const noArgumentExpressionComplaint = "No index passed to [] access.";

const knownSimpleFriendlyTypeCommands = new Map<string, string>([["string", CommandNames.StringIndex]]);

const knownComplexFriendlyTypeCommands = new Map<string, string>([
    [CommandNames.ListType, CommandNames.ListIndex],
    [CommandNames.DictionaryType, CommandNames.DictionaryIndex],
]);

export class ElementAccessExpressionVisitor extends NodeVisitor {
    public visit(node: ts.ElementAccessExpression) {
        if (node.argumentExpression === undefined) {
            console.log("node.aE", node.argumentExpression);
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedGlsLine(noArgumentExpressionComplaint)])];
        }

        const commandName = this.getCommandName(node.expression);
        if (commandName instanceof GlsLine) {
            console.log({ commandName });
            return [Transformation.fromNode(node, this.sourceFile, [createUnsupportedGlsLine(noArgumentExpressionComplaint)])];
        }

        const expression = this.router.recurseIntoValue(node.expression);
        const argument = this.router.recurseIntoValue(node.argumentExpression);

        return [Transformation.fromNode(node, this.sourceFile, [new GlsLine(commandName, expression, argument)])];
    }

    private getCommandName(expression: ts.Expression): string | GlsLine {
        const friendlyType = this.aliaser.getFriendlyTypeName(expression);
        if (friendlyType === undefined) {
            return createUnsupportedTypeGlsLine();
        }

        const [typeKey, commandsContainer] =
            typeof friendlyType === "string"
                ? [friendlyType, knownSimpleFriendlyTypeCommands]
                : [friendlyType.command, knownComplexFriendlyTypeCommands];

        const typeCommand = commandsContainer.get(typeKey);
        return typeCommand === undefined ? createUnsupportedTypeGlsLine() : typeCommand;
    }
}

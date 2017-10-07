import { CommandNames } from "general-language-syntax";
import { ElementAccessExpression, Expression } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

const noArgumentExpressionComplaint = "No index passed to [] access.";

const knownSimpleFriendlyTypeCommands = new Map<string, string>([
    ["string", CommandNames.StringIndex],
]);

const knownComplexFriendlyTypeCommands = new Map<string, string>([
    [CommandNames.ListType, CommandNames.ListIndex],
    [CommandNames.DictionaryType, CommandNames.DictionaryIndex],
]);

export class ElementAccessExpressionVisitor extends NodeVisitor {
    public visit(node: ElementAccessExpression) {
        if (node.argumentExpression === undefined) {
            return UnsupportedComplaint.forNode(
                node,
                this.sourceFile,
                noArgumentExpressionComplaint);
        }

        const commandName = this.getCommandName(node.expression);
        if (commandName instanceof UnsupportedComplaint) {
            return commandName;
        }

        const expression = this.router.recurseIntoValue(node.expression);
        if (expression instanceof UnsupportedComplaint) {
            return expression;
        }

        const argument = this.router.recurseIntoValue(node.argumentExpression);
        if (argument instanceof UnsupportedComplaint) {
            return argument;
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(commandName, expression, argument)
                ])
        ];
    }

    private getCommandName(expression: Expression) {
        const friendlyType = this.aliaser.getFriendlyTypeName(expression);
        if (friendlyType === undefined) {
            return UnsupportedComplaint.forUnsupportedTypeNode(expression, this.sourceFile);
        }

        const [typeKey, commandsContainer] = typeof friendlyType === "string"
            ? [friendlyType, knownSimpleFriendlyTypeCommands]
            : [friendlyType.command, knownComplexFriendlyTypeCommands];

        const typeCommand = commandsContainer.get(typeKey);
        return typeCommand === undefined
            ? UnsupportedComplaint.forUnsupportedTypeNode(expression, this.sourceFile)
            : typeCommand;
    }
}

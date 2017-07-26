import { SyntaxKind } from "typescript";

const knownTypeAliases: { [i: string]: string } = {
    number: "float"
};

export const getTypeAlias = (type: string) =>
    knownTypeAliases[type] === undefined
        ? type
        : knownTypeAliases[type];

export const operators = {
    [SyntaxKind.AmpersandAmpersandToken]: "and",
    [SyntaxKind.MinusEqualsToken]: "decrease by",
    [SyntaxKind.SlashToken]: "divide",
    [SyntaxKind.SlashEqualsToken]: "divide by",
    [SyntaxKind.EqualsToken]: "equals",
    [SyntaxKind.EqualsEqualsEqualsToken]: "equal to",
    [SyntaxKind.GreaterThanToken]: "greater than",
    [SyntaxKind.GreaterThanEqualsToken]: "greater than or equal to",
    [SyntaxKind.PlusEqualsToken]: "increase by",
    [SyntaxKind.LessThanToken]: "less than",
    [SyntaxKind.LessThanEqualsToken]: "less than or equal to",
    [SyntaxKind.MinusToken]: "minus",
    [SyntaxKind.PercentToken]: "mod",
    [SyntaxKind.AsteriskEqualsToken]: "multiply by",
    [SyntaxKind.ExclamationToken]: "not",
    [SyntaxKind.ExclamationEqualsEqualsToken]: "not equal to",
    [SyntaxKind.BarBarToken]: "or",
    [SyntaxKind.PlusToken]: "plus",
    [SyntaxKind.AsteriskToken]: "times"
};

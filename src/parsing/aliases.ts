import * as ts from "typescript";

export const operators = {
    [ts.SyntaxKind.AmpersandAmpersandToken]: "and",
    [ts.SyntaxKind.MinusEqualsToken]: "decrease by",
    [ts.SyntaxKind.SlashToken]: "divide",
    [ts.SyntaxKind.SlashEqualsToken]: "divide by",
    [ts.SyntaxKind.EqualsToken]: "equals",
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: "equal to",
    [ts.SyntaxKind.GreaterThanToken]: "greater than",
    [ts.SyntaxKind.GreaterThanEqualsToken]: "greater than or equal to",
    [ts.SyntaxKind.PlusEqualsToken]: "increase by",
    [ts.SyntaxKind.LessThanToken]: "less than",
    [ts.SyntaxKind.LessThanEqualsToken]: "less than or equal to",
    [ts.SyntaxKind.MinusToken]: "minus",
    [ts.SyntaxKind.PercentToken]: "mod",
    [ts.SyntaxKind.AsteriskEqualsToken]: "multiply by",
    [ts.SyntaxKind.ExclamationToken]: "not",
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "not equal to",
    [ts.SyntaxKind.BarBarToken]: "or",
    [ts.SyntaxKind.PlusToken]: "plus",
    [ts.SyntaxKind.AsteriskToken]: "times"
};

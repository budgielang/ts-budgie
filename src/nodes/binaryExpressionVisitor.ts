import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { BinaryExpression, BinaryOperatorToken, Expression, isBinaryExpression, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { operators } from "../parsing/aliases";
import { Transformation } from "../transformation";
import { visitNodes } from "./visitNode";
import { NodeVisitor } from "./visitor";

const collectOperationContents = (node: BinaryExpression): (string | Expression)[] => {
    const contents: (string | Expression)[] = [];
    const { left, right } = node;

    if (isBinaryExpression(left)) {
        contents.push(...collectOperationContents(left));
    } else {
        contents.push(left);
    }

    contents.push(operators[node.operatorToken.kind]);

    if (isBinaryExpression(right)) {
        contents.push(...collectOperationContents(right));
    } else {
        contents.push(right);
    }

    return contents;
};

export class BinaryExpressionVisitor extends NodeVisitor {
    public visit(node: BinaryExpression, sourceFile: SourceFile, typeChecker: TypeChecker) {
        const contents = collectOperationContents(node)
            .map((content) => this.recurseOnOperationContents(content, sourceFile, typeChecker));

        return [
            Transformation.fromNode(
                node,
                sourceFile,
                [
                    new GlsLine(CommandNames.Operation, ...contents)
                ])
        ];
    }

    private recurseOnOperationContents(content: string | Expression, sourceFile: SourceFile, typeChecker: TypeChecker) {
        return typeof content === "string"
            ? content
            : this.recurseOnValue(content, sourceFile, typeChecker);
    }
}

import * as ts from "typescript";

export class NewExpressionAliaser {
    private readonly sourceFile: ts.SourceFile;

    public constructor(sourceFile: ts.SourceFile) {
        this.sourceFile = sourceFile;
    }

    public getFriendlyTypeName(node: ts.NewExpression): string {
        return node.expression.getText(this.sourceFile);
    }
}

import { Identifier, LeftHandSideExpression, PropertyAccessExpression, SourceFile } from "typescript";

import { GlsLine } from "../../../glsLine";

export interface IAccessCredentials {
    expression: LeftHandSideExpression;
    expressionAlias: string | GlsLine;
    name: Identifier;
    nameAlias: string | GlsLine;
    node: PropertyAccessExpression;
}

export abstract class PropertyAccessChecker {
    protected readonly sourceFile: SourceFile;

    public constructor(sourceFile: SourceFile) {
        this.sourceFile = sourceFile;
    }

    public abstract attemptVisit(credentials: IAccessCredentials): GlsLine | undefined;
}

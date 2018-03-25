import * as ts from "typescript";

import { INodeAliaser } from "../../nodes/aliaser";
import { getNumericTypeNameFromUsages } from "../numerics";

export class NumericAliaser implements INodeAliaser {
    private readonly sourceFile: ts.SourceFile;

    public constructor(sourceFile: ts.SourceFile) {
        this.sourceFile = sourceFile;
    }

    public getFriendlyTypeName(node: ts.KeywordTypeNode | ts.NumericLiteral): string {
        return getNumericTypeNameFromUsages([node.getText(this.sourceFile)]);
    }
}

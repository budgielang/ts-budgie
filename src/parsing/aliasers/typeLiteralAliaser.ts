import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { getDictionaryTypeNameFromNode } from "../dictionaries";

import { RecursiveAliaser } from "./recursiveAliaser";

export class TypeLiteralAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: ts.TypeLiteralNode): BudgieLine | undefined {
        return getDictionaryTypeNameFromNode(node, this.recurseOntoNode);
    }
}

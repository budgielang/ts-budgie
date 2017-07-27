import { VariableDeclaration } from "typescript";

import { GlsLine } from "../../glsLine";
import { getDictionaryTypeNameFromNode } from "../dictionaries";
import { RecursiveAliaser } from "./recursiveAliaser";

export class VariableDeclarationAliaser extends RecursiveAliaser {
    public getFriendlyTypeNameForNode(node: VariableDeclaration): string | GlsLine {
        if (node.type !== undefined) {
            return this.recurseOntoNode(node.type);
        }

        if (node.initializer !== undefined) {
            return this.recurseOntoNode(node.initializer);
        }

        return "object";
    }
}

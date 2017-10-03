import { TypeLiteralNode } from "typescript";

import { GlsLine } from "../../output/glsLine";
import { getDictionaryTypeNameFromNode } from "../dictionaries";
import { RecursiveAliaser } from "./recursiveAliaser";

export class TypeLiteralAliaser extends RecursiveAliaser {
    public getFriendlyTypeName(node: TypeLiteralNode): GlsLine | undefined {
        return getDictionaryTypeNameFromNode(node, this.recurseOntoNode);
    }
}

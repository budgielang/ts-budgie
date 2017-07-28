import { Node } from "typescript";

import { GlsLine } from "../glsLine";

export interface INodeAliaser {
    getFriendlyTypeNameForNode(node: Node): string | GlsLine | undefined;
}

import { NumericLiteral } from "typescript";

import { INodeAliaser } from "../../nodes/aliaser";
import { getNumericTypeNameFromUsages } from "../numerics";

export class NumericAliaser implements INodeAliaser {
    public getFriendlyTypeNameForNode(node: NumericLiteral): string {
        return getNumericTypeNameFromUsages([node.text]);
    }
}

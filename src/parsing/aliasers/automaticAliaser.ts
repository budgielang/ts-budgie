import { INodeAliaser } from "../../nodes/aliaser";

export class AutomaticAliaser implements INodeAliaser {
    private readonly literalType: string;

    public constructor(literalType: string) {
        this.literalType = literalType;
    }

    public getFriendlyTypeNameForNode(): string {
        return this.literalType;
    }
}

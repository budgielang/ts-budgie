import * as ts from "typescript";

import { INodeAliaser } from "../../nodes/aliaser";
import { GlsLine } from "../../output/glsLine";

export type IRecurseOntoNode = (node: ts.Node) => string | GlsLine | undefined;

export abstract class RecursiveAliaser implements INodeAliaser {
    protected readonly recurseOntoNode: IRecurseOntoNode;
    protected readonly typeChecker: ts.TypeChecker;

    public constructor(typeChecker: ts.TypeChecker, recurseOntoNode: IRecurseOntoNode) {
        this.recurseOntoNode = recurseOntoNode;
        this.typeChecker = typeChecker;
    }

    public abstract getFriendlyTypeName(node: ts.Node): string | GlsLine | undefined;
}

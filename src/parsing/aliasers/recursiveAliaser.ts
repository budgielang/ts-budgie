import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, Node, TypeChecker, TypeLiteralNode } from "typescript";

import { INodeAliaser } from "../../nodes/aliaser";
import { GlsLine } from "../../output/glsLine";

export type IRecurseOntoNode = (node: Node) => string | GlsLine | undefined;

export abstract class RecursiveAliaser implements INodeAliaser {
    protected readonly recurseOntoNode: IRecurseOntoNode;
    protected readonly typeChecker: TypeChecker;

    public constructor(typeChecker: TypeChecker, recurseOntoNode: IRecurseOntoNode) {
        this.recurseOntoNode = recurseOntoNode;
        this.typeChecker = typeChecker;
    }

    public abstract getFriendlyTypeName(node: Node): string | GlsLine | undefined;
}

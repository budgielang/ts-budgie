import { SourceFile, TypeChecker } from "typescript";

import { NodeVisitRouter } from "./router";
import { NodeVisitor } from "./visitor";

export type INodeVisitorCreator = typeof NodeVisitor & {
    new(router: NodeVisitRouter, sourceFile: SourceFile, typeChecker: TypeChecker): NodeVisitor;
};

export class VisitorsBag {
    private readonly instances = new Map<INodeVisitorCreator, NodeVisitor>();
    private readonly router: NodeVisitRouter;
    private readonly sourceFile: SourceFile;
    private readonly typeChecker: TypeChecker;

    public constructor(router: NodeVisitRouter, sourceFile: SourceFile, typeChecker: TypeChecker) {
        this.router = router;
        this.sourceFile = sourceFile;
        this.typeChecker = typeChecker;
    }

    public createVisitor(creator: INodeVisitorCreator) {
        if (this.instances.has(creator)) {
            return this.instances.get(creator)!;
        }

        const visitor = new creator(this.router, this.sourceFile, this.typeChecker);
        this.instances.set(creator, visitor);
        return visitor;
    }
}

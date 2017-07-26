import { SourceFile, TypeChecker } from "typescript";

import { NodeVisitRouter } from "./router";
import { INodeVisitorDependencies, NodeVisitor } from "./visitor";

export type INodeVisitorCreator = typeof NodeVisitor & {
    new(dependencies: INodeVisitorDependencies): NodeVisitor;
};

export class VisitorsBag {
    private readonly instances = new Map<INodeVisitorCreator, NodeVisitor>();
    private readonly dependencies: INodeVisitorDependencies;

    public constructor(dependencies: INodeVisitorDependencies) {
        this.dependencies = dependencies;
    }

    public createVisitor(creator: INodeVisitorCreator) {
        if (this.instances.has(creator)) {
            return this.instances.get(creator)!;
        }

        const visitor = new creator(this.dependencies);
        this.instances.set(creator, visitor);
        return visitor;
    }
}

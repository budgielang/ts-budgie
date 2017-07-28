import { SourceFile, TypeChecker } from "typescript";

import { NodeVisitRouter } from "./router";
import { INodeVisitorDependencies, NodeVisitor } from "./visitor";

/**
 * Creates a visitor for a node type.
 */
export type INodeVisitorCreator = typeof NodeVisitor & {
    new(dependencies: INodeVisitorDependencies): NodeVisitor;
};

/**
 * Lazily creates visitors for node types.
 */
export class VisitorsBag {
    /**
     * Created visitor instances.
     */
    private readonly instances = new Map<INodeVisitorCreator, NodeVisitor>();

    /**
     * Dependencies to initialize node visitors.
     */
    private readonly dependencies: INodeVisitorDependencies;

    /**
     * Initializes a new instance of the VisitorsBag class.
     *
     * @param dependencies   Dependencies to initialize node visitors.
     */
    public constructor(dependencies: INodeVisitorDependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Creates a visitor using its creator.
     *
     * @param creator   Creates the visitor.
     * @returns A created visitor.
     */
    public createVisitor(creator: INodeVisitorCreator) {
        const previousInstance = this.instances.get(creator);
        if (previousInstance !== undefined) {
            return previousInstance;
        }

        const visitor = new creator(this.dependencies);
        this.instances.set(creator, visitor);
        return visitor;
    }
}

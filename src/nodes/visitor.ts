import { Node, SourceFile, TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { IRootAliaser } from "./aliaser";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";

export interface INodeVisitorDependencies {
    aliaser: IRootAliaser;
    router: NodeVisitRouter;
    sourceFile: SourceFile;
    typeChecker: TypeChecker;
    visitorContext: VisitorContext;
}

/**
 * Creates transformations for a node type.
 */
export abstract class NodeVisitor {
    /**
     * Generates GLS-friendly names for nodes.
     */
    protected readonly aliaser: IRootAliaser;

    /**
     * Shared context for visitors in a file.
     */
    protected readonly context: VisitorContext;

    /**
     * Routes visitors for node types.
     */
    protected readonly router: NodeVisitRouter;

    /**
     * Source file for nodes.
     */
    protected readonly sourceFile: SourceFile;

    /**
     * Type checker for the source file.
     */
    protected readonly typeChecker: TypeChecker;

    /**
     * Initializes a new instance of the NodeVisitor class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: INodeVisitorDependencies | NodeVisitor) {
        // See https://github.com/Microsoft/TypeScript/issues/17523
        if (dependencies instanceof NodeVisitor) {
            // tslint:disable-next-line:no-parameter-reassignment
            dependencies = dependencies as {} as INodeVisitorDependencies;
        }

        this.aliaser = dependencies.aliaser;
        this.context = dependencies.visitorContext;
        this.router = dependencies.router;
        this.sourceFile = dependencies.sourceFile;
        this.typeChecker = dependencies.typeChecker;
    }

    /**
     * Creates transformations for a node.
     *
     * @param node   Node to transform.
     * @returns Transformations for the node, if possible.
     */
    public abstract visit(node: Node): Transformation[] | undefined;
}

import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";
import * as ts from "typescript";

import { Transformation } from "../../../output/transformation";
import { RootAliaser } from "../../../parsing/aliasers/rootAliaser";
import { VisitorContext } from "../../context";
import { NodeVisitRouter } from "../../router";
import { INodeVisitorDependencies, NodeVisitor } from "../../visitor";

/**
 * Creates transformations for a type of property access, if possible.
 */
export abstract class PropertyAccessChecker {
    /**
     * Generates GLS-friendly names for nodes.
     */
    protected readonly aliaser: RootAliaser;

    /**
     * Transforms words between cases.
     */
    protected readonly casing: CaseStyleConverterBag;

    /**
     * Shared context for visitors in a file.
     */
    protected readonly context: VisitorContext;

    /**
     * Splits name strings into words.
     */
    protected readonly nameSplitter: NameSplitter;

    /**
     * Routes visitors for node types.
     */
    protected readonly router: NodeVisitRouter;

    /**
     * Source file for nodes.
     */
    protected readonly sourceFile: ts.SourceFile;

    /**
     * Type checker for the source file.
     */
    protected readonly typeChecker: ts.TypeChecker;

    /**
     * Initializes a new instance of the PropertyAccessChecker class.
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
        this.casing = dependencies.casing;
        this.context = dependencies.visitorContext;
        this.nameSplitter = dependencies.nameSplitter;
        this.router = dependencies.router;
        this.sourceFile = dependencies.sourceFile;
        this.typeChecker = dependencies.typeChecker;
    }

    /**
     * Creates transformations for a type of property access.
     *
     * @param node   Node to transform.
     * @returns Transformations for the node, if possible.
     */
    public abstract visit(node: ts.Node): Transformation[] | undefined;
}

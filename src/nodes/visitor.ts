import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../output/complaint";
import { Transformation } from "../output/transformation";
import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";

export interface INodeVisitorDependencies {
    aliaser: RootAliaser;
    casing: CaseStyleConverterBag;
    nameSplitter: NameSplitter;
    router: NodeVisitRouter;
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    variableUsage: Map<ts.Identifier, tsutils.VariableInfo>;
    visitorContext: VisitorContext;
}

/**
 * Creates transformations for a node type.
 */
export abstract class NodeVisitor {
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
     * Uses of each variable within the source file.
     */
    protected readonly variableUsage: Map<ts.Identifier, tsutils.VariableInfo>;

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
        this.casing = dependencies.casing;
        this.context = dependencies.visitorContext;
        this.nameSplitter = dependencies.nameSplitter;
        this.router = dependencies.router;
        this.sourceFile = dependencies.sourceFile;
        this.typeChecker = dependencies.typeChecker;
        this.variableUsage = dependencies.variableUsage;
    }

    /**
     * Creates transformations for a node.
     *
     * @param node   Node to transform.
     * @returns Transformations for the node, or a complaint for unsupported syntax.
     */
    public abstract visit(node: ts.Node): Transformation[] | UnsupportedComplaint;
}

import { Node, SourceFile, TypeChecker } from "typescript";

import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { Transformation } from "../transformation";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";

export interface INodeVisitorDependencies {
    aliaser: RootAliaser;
    router: NodeVisitRouter;
    sourceFile: SourceFile;
    typeChecker: TypeChecker;
    visitorContext: VisitorContext;
}

export abstract class NodeVisitor {
    public abstract visit(node: Node): Transformation[] | undefined;

    protected readonly aliaser: RootAliaser;
    protected readonly context: VisitorContext;
    protected readonly router: NodeVisitRouter;
    protected readonly sourceFile: SourceFile;
    protected readonly typeChecker: TypeChecker;

    public constructor(dependencies: INodeVisitorDependencies) {
        this.aliaser = dependencies.aliaser;
        this.context = dependencies.visitorContext;
        this.router = dependencies.router;
        this.sourceFile = dependencies.sourceFile;
        this.typeChecker = dependencies.typeChecker;
    }
}

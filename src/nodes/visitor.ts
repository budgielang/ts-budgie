import { Node, SourceFile, TypeChecker } from "typescript";

import { printTransformations } from "../printing";
import { Transformation } from "../transformation";
import { NodeVisitRouter } from "./router";

export abstract class NodeVisitor {
    public abstract visit(node: Node): Transformation[] | undefined;

    protected readonly router: NodeVisitRouter;
    protected readonly sourceFile: SourceFile;
    protected readonly typeChecker: TypeChecker;

    public constructor(router: NodeVisitRouter, sourceFile: SourceFile, typeChecker: TypeChecker) {
        this.router = router;
        this.sourceFile = sourceFile;
        this.typeChecker = typeChecker;
    }
}

import { Node, SourceFile, TypeChecker } from "typescript";

import { Transformation } from "../transformation";
import { NodeVisitRouter } from "./router";
import { NodeVisitor } from "./visitor";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";

export const visitSourceFile = (sourceFile: SourceFile, typeChecker: TypeChecker) => {
    const visitorCreatorsBag = new VisitorCreatorsBag();
    const router = new NodeVisitRouter(sourceFile, typeChecker, visitorCreatorsBag);

    return router.recurseIntoNode(sourceFile) || [];
};

import { Node, SourceFile, TypeChecker } from "typescript";

import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { Transformation } from "../transformation";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";
import { NodeVisitor } from "./visitor";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";

export const visitSourceFile = (sourceFile: SourceFile, typeChecker: TypeChecker) => {
    const aliaser = new RootAliaser(typeChecker);
    const visitorContext = new VisitorContext();
    const visitorCreatorsBag = new VisitorCreatorsBag();

    const router = new NodeVisitRouter({
        aliaser, sourceFile, typeChecker, visitorContext, visitorCreatorsBag
    });

    return router.recurseIntoNode(sourceFile) || [];
};

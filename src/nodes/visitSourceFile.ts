import { CaseStyleConverterBag } from "general-language-syntax";
import { Node, SourceFile, TypeChecker } from "typescript";

import { UnsupportedComplaint } from "../output/complaint";
import { Transformation } from "../output/transformation";
import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { TransformationsPrinter } from "../printing/transformationsPrinter";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";
import { NodeVisitor } from "./visitor";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";

export const visitSourceFile = (sourceFile: SourceFile, typeChecker: TypeChecker): Transformation[] | UnsupportedComplaint => {
    const aliaser = new RootAliaser(sourceFile, typeChecker);
    const casing = new CaseStyleConverterBag();
    const printer = new TransformationsPrinter();
    const visitorContext = new VisitorContext();
    const visitorCreatorsBag = new VisitorCreatorsBag();

    const router = new NodeVisitRouter({
        aliaser, casing, printer, sourceFile, typeChecker, visitorContext, visitorCreatorsBag
    });

    return router.recurseIntoNodes(sourceFile.statements);
};

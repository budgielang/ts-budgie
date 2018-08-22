import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";
import * as tsutils from "tsutils";

import { UnsupportedComplaint } from "../output/complaint";
import { Transformation } from "../output/transformation";
import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { TransformationsPrinter } from "../printing/transformationsPrinter";
import { ITransformerSettings } from "../service";
import { VisitorContext } from "./context";
import { NodeVisitRouter } from "./router";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";

export const visitSourceFile = (
    { contextOptions, sourceFile, typeChecker }: ITransformerSettings,
): (Transformation | UnsupportedComplaint)[] => {
    const aliaser = new RootAliaser(sourceFile, typeChecker);
    const casing = new CaseStyleConverterBag();
    const nameSplitter = new NameSplitter();
    const printer = new TransformationsPrinter();
    const variableUsage = tsutils.collectVariableUsage(sourceFile);
    const visitorContext = new VisitorContext(contextOptions);
    const visitorCreatorsBag = new VisitorCreatorsBag();

    const router = new NodeVisitRouter({
        aliaser,
        casing,
        printer,
        nameSplitter,
        sourceFile,
        typeChecker,
        variableUsage,
        visitorContext,
        visitorCreatorsBag
    });

    return router.recurseIntoSourceFile();
};
